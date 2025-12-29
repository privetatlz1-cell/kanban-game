import React from 'react';
import Column from './Column';
import { COLUMNS } from '../types.ts';
import { useGameStore } from '../store.ts';

const KanbanBoard = () => {
  const tasks = useGameStore(state => state.tasks);
  
  // Логирование для отладки
  console.log('KanbanBoard render - tasks count:', tasks.length);
  console.log('Tasks in backlog:', tasks.filter(t => t.columnId === 'backlog').length);
  
  // Отдельно показываем Expedite lane
  const expediteTasks = tasks.filter(t => t.columnId === 'expedite');
  const regularColumns = COLUMNS.filter(c => c.id !== 'expedite').sort((a, b) => a.order - b.order);
  
  return (
    <div className="space-y-4">
      {/* Expedite Lane */}
      {expediteTasks.length > 0 && (
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2 text-yellow-900">🚨 Срочно</h2>
          <div className="flex gap-2 flex-wrap">
            {expediteTasks.map(task => (
              <Column
                key={`expedite-${task.id}`}
                columnId="expedite"
                tasks={[task]}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {regularColumns.map((column) => (
          <Column
            key={column.id}
            columnId={column.id}
            tasks={tasks.filter(t => t.columnId === column.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;

