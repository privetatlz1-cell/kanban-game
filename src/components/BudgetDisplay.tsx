import React from 'react';
import { formatCurrency } from '../types.ts';

interface BudgetDisplayProps {
  money: number;
  day: number;
}

const BudgetDisplay = ({ money, day }: BudgetDisplayProps) => {
  const displayMoney = money ?? 0;
  const displayDay = day ?? 0;
  const isOverBudget = displayMoney < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
          💰 Финансовое состояние
        </h2>
        <span className="text-sm font-semibold" style={{ color: '#6E6F70', fontFamily: 'Montserrat, sans-serif' }}>
          День {displayDay}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Остаток средств:</span>
            <span className={`font-bold text-2xl ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(displayMoney)}
            </span>
          </div>
          {isOverBudget && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              <strong>⚠️ Превышен бюджет!</strong> Проект остановлен.
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          💡 Накладные расходы: {formatCurrency(500)}/день | Приёмка: +{formatCurrency(5000)} | Сдача: +{formatCurrency(10000)}
        </div>
      </div>
    </div>
  );
};

export default BudgetDisplay;

