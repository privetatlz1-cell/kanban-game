import React from 'react';
import TaskCard from './TaskCard';
import { COLUMNS } from '../types.ts';
import { useGameStore } from '../store.ts';

const Column = ({ columnId, tasks }: { columnId: string; tasks: any[] }) => {
  const column = COLUMNS.find(c => c.id === columnId);
  if (!column) return null;
  
  const moveTask = useGameStore(state => state.moveTask);
  
  // Разделяем задачи по подколонкам
  const readyTasks = tasks.filter(t => t.subColumn === 'Ready');
  const doingTasks = tasks.filter(t => t.subColumn === 'Doing');
  
  const wipLimit = column.wipLimit;
  const currentWIP = doingTasks.length;
  const isWIPExceeded = wipLimit !== null && currentWIP >= wipLimit;
  
  return (
    <div
      className={`flex-1 min-w-[300px] rounded-lg p-4 ${
        isWIPExceeded ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
            {column.name}
          </h2>
          {wipLimit !== null && (
            <span className={`text-xs px-2 py-1 rounded font-semibold ${
              isWIPExceeded ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
            }`}>
              WIP: {currentWIP} / {wipLimit}
            </span>
          )}
        </div>
      </div>
      
      {column.hasSubColumns ? (
        <div className="space-y-4">
          {/* Doing Subcolumn */}
          <div className="bg-white rounded p-2 border-2 border-blue-300">
            <div className="text-xs font-semibold text-blue-700 mb-2">⚙️ Doing</div>
            <div className="space-y-2 min-h-[100px]">
              {doingTasks.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-4">Пусто</div>
              ) : (
                doingTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
          
          {/* Ready Subcolumn */}
          <div className="bg-white rounded p-2 border-2 border-green-300">
            <div className="text-xs font-semibold text-green-700 mb-2">✓ Ready</div>
            <div className="space-y-2 min-h-[100px]">
              {readyTasks.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-4">Пусто</div>
              ) : (
                readyTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // Колонки без подколонок (backlog, acceptance, done, expedite)
        <div className="space-y-2 min-h-[100px]">
          {tasks.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              {columnId === 'backlog' ? 'Нет задач' : 'Пусто'}
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Column;

