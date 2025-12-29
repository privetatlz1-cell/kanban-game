import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanGame from './KanbanGame';

function App() {
  try {
    return (
      <DndProvider backend={HTML5Backend}>
        <KanbanGame />
      </DndProvider>
    );
  } catch (error) {
    console.error('Error in App:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка приложения</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Очистить и перезагрузить
          </button>
        </div>
      </div>
    );
  }
}

export default App;
