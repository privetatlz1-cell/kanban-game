import React from 'react';
import { formatCurrency } from '../types.ts';

const BudgetDisplay = ({ cash = 0, totalRevenue = 0, totalDirectCosts = 0, totalOverhead = 0, currentDay = 0 }) => {
  const profit = (totalRevenue || 0) - (totalDirectCosts || 0) - (totalOverhead || 0);
  const isOverBudget = (cash || 0) < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>Финансовое состояние проекта</h2>
        <span className="text-sm font-semibold" style={{ color: '#6E6F70', fontFamily: 'Montserrat, sans-serif' }}>День {currentDay}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Остаток средств:</span>
            <span className={`font-bold text-lg ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(cash)}
            </span>
          </div>
          {isOverBudget && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              <strong>Превышен бюджет!</strong> Проект остановлен.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 block mb-1">Общий доход</span>
            <p className="font-semibold text-green-600 text-lg">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 block mb-1">Прямые расходы</span>
            <p className="font-semibold text-red-600 text-lg">
              {formatCurrency(totalDirectCosts)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 block mb-1">Накладные расходы</span>
            <p className="font-semibold text-orange-600 text-lg">
              {formatCurrency(totalOverhead)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 block mb-1">Чистая прибыль</span>
            <p className={`font-semibold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDisplay;
