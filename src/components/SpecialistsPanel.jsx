import React from 'react';
import SpecialistAvatar from './SpecialistAvatar';
import { SPECIALISTS } from '../types';

const SpecialistsPanel = ({ availableSpecialists, todayAssignments, onRemoveSpecialist }) => {
  const getAssignedCount = (specType) => {
    if (!todayAssignments) return 0;
    let count = 0;
    Object.values(todayAssignments).forEach(assignments => {
      const assignmentArray = Array.isArray(assignments) ? assignments : [assignments];
      assignmentArray.forEach(assignedId => {
        const spec = Object.values(availableSpecialists[specType] || []).find(s => s.id === assignedId);
        if (spec) {
          const specialistKey = Object.keys(SPECIALISTS).find(key => SPECIALISTS[key].id === specType);
          if (specialistKey && SPECIALISTS[specialistKey].id === specType) {
            count++;
          }
        }
      });
    });
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
        👥 Доступные специалисты
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(SPECIALISTS).map((specialist) => {
          const instances = availableSpecialists[specialist.id] || [];
          const assignedCount = getAssignedCount(specialist.id);
          const freeCount = instances.length - assignedCount;
          
          return (
            <div
              key={specialist.id}
              className="border border-gray-200 rounded-lg p-3"
              style={{ borderLeftColor: specialist.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{specialist.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800">{specialist.shortName}</h3>
                  <p className="text-xs text-gray-500">{specialist.name}</p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Свободно:</span>
                  <span className={`font-semibold ${freeCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {freeCount} / {instances.length}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {instances.map((instance) => {
                  const isAssigned = todayAssignments && Object.values(todayAssignments).some(assignments => {
                    const assignmentArray = Array.isArray(assignments) ? assignments : [assignments];
                    return assignmentArray.includes(instance.id);
                  });
                  
                  return (
                    <SpecialistAvatar
                      key={instance.id}
                      specialistInstance={instance}
                      specialistType={specialist.id}
                      isAssigned={isAssigned}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialistsPanel;

