import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  TASK_TYPES, 
  COLUMNS, 
  SPECIALISTS, 
  CONTRACTORS,
  formatCurrency,
  getTaskDirectCost,
  getTaskRevenue,
  getContractor,
  calculateTaskCost,
  calculateTaskRevenue,
} from '../types.ts';
import SpecialistAvatar from './SpecialistAvatar';

const TaskCard = ({ 
  task, 
  availableSpecialists, 
  todayAssignments, 
  onAssignSpecialist, 
  onUnassignSpecialist,
  onUpdateContractor
}) => {
  // Разрешаем drag только для задач в Backlog
  const canDrag = task.columnId === 'backlog';
  
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop zone для специалистов
  const [{ isOver }, drop] = useDrop({
    accept: 'specialist',
    drop: (item) => {
      if (onAssignSpecialist) {
        onAssignSpecialist(task.id, item.instanceId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const taskType = Object.values(TASK_TYPES).find(t => t.id === task.type);
  
  // Получаем список назначенных специалистов для этой задачи
  const getAssignedSpecialists = () => {
    if (!todayAssignments || !todayAssignments[task.id]) return [];
    
    const assignments = todayAssignments[task.id];
    const assignmentArray = Array.isArray(assignments) ? assignments : [assignments];
    
    const assigned = [];
    assignmentArray.forEach(specialistInstanceId => {
      for (const specType in availableSpecialists) {
        const instance = availableSpecialists[specType]?.find(s => s.id === specialistInstanceId);
        if (instance) {
          const specialistKey = Object.keys(SPECIALISTS).find(
            key => SPECIALISTS[key].id === specType
          );
          if (specialistKey) {
            assigned.push({
              instance,
              specialist: SPECIALISTS[specialistKey],
              type: specType,
            });
          }
          break;
        }
      }
    });
    
    return assigned;
  };

  const assignedSpecialists = getAssignedSpecialists();
  
  // Рабочие колонки
  const workingColumns = ['design', 'executive', 'materials', 'survey', 'construction'];
  const isWorkingColumn = workingColumns.includes(task.columnId);
  const canAssignSpecialist = isWorkingColumn && task.remainingWork > 0;
  
  // Можно выбрать подрядчика только для задач в backlog или ready
  const canSelectContractor = (task.columnId === 'backlog' || task.columnId === 'ready') && !task.started;
  const availableContractors = task.type ? (CONTRACTORS[task.type] || []) : [];
  
  // Локальное состояние для выбранного подрядчика (для динамического пересчета)
  const [selectedContractorId, setSelectedContractorId] = useState(task.contractorId || '');
  
  // Синхронизируем локальное состояние с задачей
  useEffect(() => {
    setSelectedContractorId(task.contractorId || '');
  }, [task.contractorId]);
  
  // Используем локальное состояние для расчета, если можно выбрать подрядчика
  const contractorIdForCalculation = canSelectContractor ? selectedContractorId : task.contractorId;
  const selectedContractor = contractorIdForCalculation ? getContractor(contractorIdForCalculation) : null;
  
  // Получаем стоимость и доход с учетом подрядчика (динамически пересчитываем)
  const baseDirectCost = task.baseDirectCost || task.directCost || 0;
  const baseRevenue = task.baseRevenue || task.revenue || 0;
  const taskDirectCost = contractorIdForCalculation 
    ? calculateTaskCost(baseDirectCost, contractorIdForCalculation)
    : getTaskDirectCost(task);
  const taskRevenue = contractorIdForCalculation
    ? calculateTaskRevenue(baseRevenue, contractorIdForCalculation)
    : getTaskRevenue(task);
  const profit = task.columnId === 'acceptance' ? taskRevenue - taskDirectCost : null;

  return (
    <div
      ref={(node) => {
        if (canDrag) drag(node);
        if (canAssignSpecialist) drop(node);
      }}
      className={`bg-white rounded-lg shadow-md p-4 mb-3 ${
        canDrag ? 'cursor-move' : 'cursor-default'
      } border-l-4 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${
        isOver && canAssignSpecialist ? 'ring-2' : ''
      }`}
      style={{
        borderLeftColor: '#EC6428',
        ringColor: isOver && canAssignSpecialist ? '#EC6428' : 'transparent',
        backgroundColor: isOver && canAssignSpecialist ? '#FFF5F0' : 'white',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>{task.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span>{taskType?.icon}</span>
            <span className="font-medium">
              Объём работ: {task.remainingWork} / {task.workVolume}
            </span>
          </div>
        </div>
      </div>

      {/* Прогресс-бар для оставшейся работы */}
      {task.remainingWork < task.workVolume && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ 
                width: `${((task.workVolume - task.remainingWork) / task.workVolume) * 100}%`,
                backgroundColor: '#EC6428',
              }}
            />
          </div>
        </div>
      )}

      {/* Выбор подрядчика */}
      {canSelectContractor && availableContractors.length > 0 && (
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Подрядчик:
          </label>
          <select
            value={selectedContractorId || ''}
            onChange={(e) => {
              const newContractorId = e.target.value;
              setSelectedContractorId(newContractorId); // Обновляем локальное состояние для мгновенного пересчета
              if (onUpdateContractor && newContractorId) {
                onUpdateContractor(task.id, newContractorId);
              }
            }}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          >
            {availableContractors.map((contractor) => (
              <option key={contractor.id} value={contractor.id}>
                {contractor.icon} {contractor.name} ({contractor.speedMultiplier > 1 ? '×' + contractor.speedMultiplier : '×' + contractor.speedMultiplier} скорость, {contractor.costMultiplier > 1 ? '+' + Math.round((contractor.costMultiplier - 1) * 100) + '%' : '-' + Math.round((1 - contractor.costMultiplier) * 100) + '%'} стоимость)
              </option>
            ))}
          </select>
          {selectedContractor && (
            <p className="text-xs text-gray-500 mt-1">{selectedContractor.description}</p>
          )}
        </div>
      )}

      {/* Отображение выбранного подрядчика (если задача уже начата) */}
      {!canSelectContractor && selectedContractor && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs">
            <span>Подрядчик:</span>
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: `${selectedContractor.color}20`,
                color: selectedContractor.color,
              }}
            >
              {selectedContractor.icon} {selectedContractor.name}
            </span>
          </div>
        </div>
      )}

      {/* Финансовая информация */}
      <div className="mb-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Расходы:</span>
          <span className="font-semibold text-red-600">{formatCurrency(taskDirectCost || task.directCost || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Доход:</span>
          <span className={`font-semibold ${task.columnId === 'acceptance' ? 'text-green-600' : 'text-gray-400'}`}>
            {formatCurrency(taskRevenue || task.revenue || 0)}
          </span>
        </div>
        {profit !== null && profit !== undefined && (
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Прибыль:</span>
            <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        )}
      </div>

      {/* Назначенные специалисты */}
      {canAssignSpecialist && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Назначенные специалисты:</span>
            {isOver && (
              <span className="text-xs text-blue-600 font-semibold">Перетащите сюда специалиста</span>
            )}
          </div>
          {assignedSpecialists.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedSpecialists.map(({ instance, specialist, type }) => {
                const isInPrimaryColumn = specialist.primaryColumn === task.columnId;
                return (
                  <div key={instance.id} className="relative">
                    <SpecialistAvatar
                      specialistInstance={instance}
                      specialistType={type}
                      isAssigned={true}
                      onRemove={onUnassignSpecialist}
                      taskId={task.id}
                    />
                    {isInPrimaryColumn && (
                      <span 
                        className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                        title="Эффективность ×2"
                      >
                        ⚡
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic py-2 text-center border-2 border-dashed border-gray-300 rounded">
              Перетащите специалиста с панели выше
            </div>
          )}
        </div>
      )}

      {task.columnId === 'acceptance' && (
        <div className="mt-2 text-xs text-green-600 font-semibold">
          ✓ Сдано
        </div>
      )}
    </div>
  );
};

export default TaskCard;
