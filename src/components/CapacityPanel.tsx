import React from 'react';
import { formatNumber } from '../types.ts';

interface CapacityPanelProps {
  capacity: {
    rd: number;
    geo: number;
    smr: number;
    lab: number;
    hse: number;
  };
}

const CapacityPanel = ({ capacity }: CapacityPanelProps) => {
  const capacityItems = [
    { key: 'rd', label: 'RD (Рабочая документация)', value: capacity.rd, color: '#3B82F6' },
    { key: 'geo', label: 'Geo (Геодезия)', value: capacity.geo, color: '#F97316' },
    { key: 'smr', label: 'SMR (Строительство)', value: capacity.smr, color: '#10B981' },
    { key: 'lab', label: 'Lab (Лаборатория)', value: capacity.lab, color: '#A855F7' },
    { key: 'hse', label: 'HSE (Безопасность)', value: capacity.hse, color: '#6B7280' },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
        💪 Доступная мощность (Capacity)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {capacityItems.map(item => (
          <div
            key={item.key}
            className="border border-gray-200 rounded-lg p-3 text-center"
            style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
          >
            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
            <div
              className="text-2xl font-bold"
              style={{ color: item.color, fontFamily: 'Montserrat, sans-serif' }}
            >
              {formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        💡 Используйте кнопки на карточках задач для траты capacity. 2 RD можно конвертировать в 1 Lab.
      </div>
    </div>
  );
};

export default CapacityPanel;

