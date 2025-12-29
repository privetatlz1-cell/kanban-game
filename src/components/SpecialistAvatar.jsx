import React from 'react';
import { useDrag } from 'react-dnd';
import { SPECIALISTS } from '../types.ts';

const SpecialistAvatar = ({ specialistInstance, specialistType, isAssigned = false, onRemove, taskId }) => {
  const specialist = Object.values(SPECIALISTS).find(s => s.id === specialistType);
  
  if (!specialist) return null;
  
  // Разрешаем drag только если специалист не назначен
  const canDrag = !isAssigned;
  
  const [{ isDragging }, drag] = useDrag({
    type: 'specialist',
    item: { 
      id: specialistInstance.id, 
      type: specialistType,
      instanceId: specialistInstance.id 
    },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div className="relative inline-block">
      <div
        ref={canDrag ? drag : null}
        className={`inline-flex items-center justify-center rounded-full cursor-${canDrag ? 'move' : 'default'} transition-all ${
          isDragging ? 'opacity-50' : 'opacity-100'
        } ${isAssigned ? 'ring-2 ring-offset-1' : ''}`}
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: `${specialist.color}20`,
          border: `2px solid ${specialist.color}`,
          ringColor: specialist.color,
        }}
        title={specialist.name}
      >
        <span className="text-lg">{specialist.icon}</span>
      </div>
      {isAssigned && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(taskId, specialistInstance.id);
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
          style={{ fontSize: '10px' }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SpecialistAvatar;
