import React from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { COLUMNS } from '../types.ts';

const Column = ({ column, tasks = [], onMoveTask, availableSpecialists = {}, todayAssignments = {}, onAssignSpecialist, onUnassignSpecialist, onUpdateContractor }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => {
      onMoveTask(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const columnTasks = tasks.filter((task) => task.columnId === column.id);
  const columnConfig = COLUMNS.find(c => c.id === column.id);
  const wipLimit = columnConfig?.wipLimit;
  const isWIPExceeded = wipLimit !== null && columnTasks.length >= wipLimit;
  
  // Разрешаем drop только для Backlog → Ready
  const canDrop = column.id === 'ready' && isOver;

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] rounded-lg p-4 ${
        isOver && canDrop ? 'border-2' : ''
      } ${
        isWIPExceeded ? 'border-2 bg-red-50' : ''
      }`}
      style={{
        backgroundColor: isOver && canDrop ? '#FFF5F0' : '#F5F5F5',
        borderColor: isOver && canDrop ? '#EC6428' : (isWIPExceeded ? '#EF4444' : 'transparent'),
      }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-sm" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>{column.name}</h2>
          {wipLimit !== null && (
            <span className={`text-xs px-2 py-1 rounded ${
              isWIPExceeded ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            }`}>
              {columnTasks.length} / {wipLimit}
            </span>
          )}
        </div>
        {wipLimit === null && (
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
            {columnTasks.length} задач
          </span>
        )}
        {isWIPExceeded && (
          <p className="text-xs text-red-600 mt-1 font-semibold">
            ⚠️ Лимит WIP превышен!
          </p>
        )}
      </div>

      <div className="space-y-2 min-h-[200px]">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            availableSpecialists={availableSpecialists}
            todayAssignments={todayAssignments}
            onAssignSpecialist={onAssignSpecialist}
            onUnassignSpecialist={onUnassignSpecialist}
            onUpdateContractor={onUpdateContractor}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
