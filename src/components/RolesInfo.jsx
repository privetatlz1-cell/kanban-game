import React, { useState } from 'react';
import { SPECIALISTS, COLUMNS } from '../types';

const RolesInfo = ({ availableSpecialists, todayAssignments }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getAvailableCount = (specType) => {
    if (!availableSpecialists || !availableSpecialists[specType] || !Array.isArray(availableSpecialists[specType])) return 0;
    return availableSpecialists[specType].filter(s => !s.assignedToTask || (todayAssignments && todayAssignments[s.assignedToTask] === s.id)).length;
  };

  const getAssignedCount = (specType) => {
    if (!availableSpecialists || !availableSpecialists[specType] || !Array.isArray(availableSpecialists[specType])) return 0;
    return availableSpecialists[specType].filter(s => s.assignedToTask && todayAssignments && todayAssignments[s.assignedToTask] === s.id).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">
          ℹ️ Информация о специалистах и их доступности
        </h2>
        <span className="text-gray-600">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(SPECIALISTS).map((specialist) => {
              const available = getAvailableCount(specialist.id);
              const assigned = getAssignedCount(specialist.id);
              const total = specialist.count;
              const primaryColumn = specialist.primaryColumn 
                ? COLUMNS.find(col => col.id === specialist.primaryColumn)
                : null;

              return (
                <div
                  key={specialist.id}
                  className="border border-gray-200 rounded-lg p-4"
                  style={{ borderLeftColor: specialist.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{specialist.icon}</span>
                    <h3 className="font-semibold text-gray-800">{specialist.name}</h3>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Доступно:</span>
                      <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {available} / {total}
                      </span>
                    </div>
                    {assigned > 0 && (
                      <div className="text-xs text-gray-500">
                        Назначено сегодня: {assigned}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    {primaryColumn ? (
                      <>
                        <p className="text-xs text-gray-600 mb-1">Основная колонка:</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span
                            className="text-xs px-2 py-1 bg-gray-100 rounded"
                            style={{ color: specialist.color }}
                          >
                            {primaryColumn.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          ⚡ Эффективность ×2 в основной колонке
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Может работать в любой колонке, но без бонуса эффективности
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesInfo;
