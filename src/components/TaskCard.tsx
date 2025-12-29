import React from 'react';
import { ITask, TASK_ARCHETYPES, formatCurrency } from '../types';
import { useGameStore } from '../store/useGameStore';

const TaskCard = ({ task }: { task: ITask }) => {
  const spendCapacity = useGameStore(state => state.spendCapacity);
  const unblockTask = useGameStore(state => state.unblockTask);
  const capacity = useGameStore(state => state.capacity);
  const moveTask = useGameStore(state => state.moveTask);
  
  const archetype = TASK_ARCHETYPES[task.type];
  
  // Определяем текущий активный сегмент
  const getActiveSegment = (): 'rd' | 'geo' | 'smr' | 'lab' | null => {
    if (task.progress.rd > 0 && task.columnId === 'rd') return 'rd';
    if (task.progress.geo > 0 && task.columnId === 'geo') return 'geo';
    if (task.progress.smr > 0 && task.columnId === 'smr') return 'smr';
    if (task.progress.lab > 0 && task.columnId === 'lab') return 'lab';
    return null;
  };
  
  const activeSegment = getActiveSegment();
  const isDoing = task.subColumn === 'Doing';
  const isBlocked = task.isBlocked;
  const isCuring = task.status === 'curing';
  
  // Кнопка для траты capacity
  const handleSpendCapacity = (amount: number) => {
    if (!activeSegment || !isDoing || isBlocked) return;
    spendCapacity(task.id, activeSegment, amount);
  };
  
  // Кнопка для разблокировки
  const handleUnblock = () => {
    if (!isBlocked) return;
    if (task.blockType === 'design_error') {
      unblockTask(task.id, 'rd', 5);
    } else if (task.blockType === 'safety_violation') {
      unblockTask(task.id, 'hse', 2);
    }
  };
  
  // Кнопка для перехода в следующую колонку
  const handleMoveNext = () => {
    if (task.subColumn !== 'Ready') return;
    
    const columnOrder = ['rd', 'geo', 'smr', 'lab', 'acceptance', 'done'];
    const currentIndex = columnOrder.indexOf(task.columnId);
    if (currentIndex < columnOrder.length - 1) {
      const nextColumn = columnOrder[currentIndex + 1];
      moveTask(task.id, nextColumn, 'Ready');
    }
  };
  
  // Прогресс-бар для сегмента
  const ProgressBar = ({ label, current, total, color }: { label: string; current: number; total: number; color: string }) => {
    const percentage = total > 0 ? ((total - current) / total) * 100 : 0;
    return (
      <div className="mb-1">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="font-medium">{label}:</span>
          <span>{current} / {total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all`}
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-2 ${
        isBlocked ? 'border-red-500 bg-red-50' :
        isCuring ? 'border-orange-500 bg-orange-50' :
        task.status === 'expedite' ? 'border-yellow-500 bg-yellow-50' :
        'border-gray-200'
      }`}
    >
      {/* Заголовок */}
      <div className="mb-2">
        <h3 className="font-semibold text-sm mb-1" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
          {task.title}
        </h3>
        <div className="text-xs text-gray-500">{archetype.name}</div>
      </div>
      
      {/* Статусы */}
      {isBlocked && (
        <div className="mb-2 p-2 bg-red-100 rounded text-xs">
          <div className="font-semibold text-red-700 mb-1">
            ⚠️ Заблокировано: {task.blockType === 'design_error' ? 'Ошибка проектирования' : 'Нарушение безопасности'}
          </div>
          <button
            onClick={handleUnblock}
            disabled={
              (task.blockType === 'design_error' && capacity.rd < 5) ||
              (task.blockType === 'safety_violation' && capacity.hse < 2)
            }
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
          >
            Разблокировать ({task.blockType === 'design_error' ? '5 RD' : '2 HSE'})
          </button>
        </div>
      )}
      
      {isCuring && task.curingDays !== undefined && (
        <div className="mb-2 p-2 bg-orange-100 rounded text-xs">
          <div className="font-semibold text-orange-700">
            ⏳ Отверждение: {task.curingDays} дн.
          </div>
        </div>
      )}
      
      {/* Прогресс-бары */}
      <div className="mb-2 space-y-1">
        <ProgressBar label="RD" current={task.progress.rd} total={task.requirements.rd} color="#3B82F6" />
        <ProgressBar label="Geo" current={task.progress.geo} total={task.requirements.geo} color="#F97316" />
        <ProgressBar label="SMR" current={task.progress.smr} total={task.requirements.smr} color="#10B981" />
        <ProgressBar label="Lab" current={task.progress.lab} total={task.requirements.lab} color="#A855F7" />
      </div>
      
      {/* Кнопки управления */}
      {isDoing && activeSegment && !isBlocked && !isCuring && (
        <div className="mb-2 flex gap-1 flex-wrap">
          <button
            onClick={() => handleSpendCapacity(1)}
            disabled={capacity[activeSegment] < 1}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            +1 {activeSegment.toUpperCase()}
          </button>
          <button
            onClick={() => handleSpendCapacity(2)}
            disabled={capacity[activeSegment] < 2}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            +2 {activeSegment.toUpperCase()}
          </button>
          <button
            onClick={() => handleSpendCapacity(5)}
            disabled={capacity[activeSegment] < 5}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            +5 {activeSegment.toUpperCase()}
          </button>
        </div>
      )}
      
      {/* Кнопка перехода в следующую колонку */}
      {task.subColumn === 'Ready' && activeSegment === null && task.columnId !== 'done' && (
        <button
          onClick={handleMoveNext}
          className="w-full px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
        >
          → Следующая колонка
        </button>
      )}
      
      {/* Финансы */}
      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Приёмка:</span>
          <span className="font-semibold text-green-600">+{formatCurrency(task.revenueOnAcceptance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Сдача:</span>
          <span className="font-semibold text-green-600">+{formatCurrency(task.revenueOnDone)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

