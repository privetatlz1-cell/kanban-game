import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COLUMNS, formatCurrency, formatNumber } from '../types.ts';

const MetricsCharts = ({ history = [], tasks = [] }) => {
  // Скрываем графики, если нет данных
  const hasHistory = (history || []).length > 0;
  const hasMultipleDays = (history || []).length > 1;
  const hasData = hasHistory && (hasMultipleDays || ((history || []).length === 1 && (history[0]?.day || 0) > 0));
  
  if (!hasData || !hasHistory) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
        <p className="text-gray-500 text-center">Графики появятся после начала игры</p>
      </div>
    );
  }
  
  // Подготовка данных для Cumulative Flow Diagram
  const cfdData = (history || []).map((h) => ({
    день: h?.day || 0,
    ...(h?.columnDistribution || {}),
  }));

  // Подготовка данных для финансового графика
  const budgetData = (history || []).map((h) => ({
    день: h?.day || 0,
    доходы: h?.revenue || 0,
    расходы: h?.costs || 0,
    прибыль: h?.profit || 0,
    остаток: h?.money || 0,
  }));

  // Подготовка данных для Cycle Time (от Ready до Handed Over)
  const completedTasks = (tasks || []).filter((t) => t && t.completedAt !== null && t.completedAt !== undefined);
  const cycleTimeData = completedTasks.map((task) => {
    // Approximate cycle time from creation to completion
    const cycleTime = task.completedAt - (task.createdAt || 0);
    return {
      задача: task.title && task.title.length > 30 ? task.title.substring(0, 30) + '...' : (task.title || 'Задача'),
      'Время выполнения': Math.max(0, cycleTime),
    };
  });

  // Форматирование для Tooltip
  const currencyFormatter = (value) => formatCurrency(value);
  const numberFormatter = (value) => formatNumber(value);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
          Диаграмма накопленного потока (CFD)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cfdData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="день" />
            <YAxis />
            <Tooltip />
            <Legend />
            {COLUMNS.map((col, index) => (
              <Area
                key={col.id}
                type="monotone"
                dataKey={col.id}
                stackId="1"
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                fill={`hsl(${index * 45}, 70%, 50%)`}
                name={col.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
          Финансовая диаграмма
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="день" />
            <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(1)} млрд`} />
            <Tooltip 
              formatter={currencyFormatter}
              labelFormatter={(label) => `День ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="доходы"
              stroke="#10B981"
              strokeWidth={2}
              name="Доходы"
            />
            <Line
              type="monotone"
              dataKey="расходы"
              stroke="#EF4444"
              strokeWidth={2}
              name="Расходы"
            />
            <Line
              type="monotone"
              dataKey="прибыль"
              stroke="#EC6428"
              strokeWidth={2}
              name="Прибыль"
            />
            <Line
              type="monotone"
              dataKey="остаток"
              stroke="#6E6F70"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Остаток средств"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {cycleTimeData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
            Время выполнения (Cycle Time)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cycleTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="задача" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis label={{ value: 'Дни', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Время выполнения"
                fill="#EC6428"
                name="Время выполнения (дни)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MetricsCharts;
