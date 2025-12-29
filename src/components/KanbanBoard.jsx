import React from 'react';
import Column from './Column';
import { COLUMNS } from '../types.ts';

const KanbanBoard = ({ tasks = [], onMoveTask, availableSpecialists = {}, todayAssignments = {}, onAssignSpecialist, onUnassignSpecialist, onUpdateContractor }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks || []}
            onMoveTask={onMoveTask}
            availableSpecialists={availableSpecialists || {}}
            todayAssignments={todayAssignments || {}}
            onAssignSpecialist={onAssignSpecialist}
            onUnassignSpecialist={onUnassignSpecialist}
            onUpdateContractor={onUpdateContractor}
          />
      ))}
    </div>
  );
};

export default KanbanBoard;

