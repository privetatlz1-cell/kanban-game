import React from 'react';

const GameControls = ({ 
  onNextDay, 
  currentDay = 0, 
  gameOver = false, 
  gameWon = false, 
  onReset,
  todayAssignments = {},
}) => {
  const hasAssignments = todayAssignments && Object.keys(todayAssignments).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>Управление игрой</h2>
        <p className="text-sm text-gray-600">
          Назначьте специалистов на задачи в колонках, затем нажмите "Следующий день"
        </p>
        {hasAssignments && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Назначено специалистов: {Object.keys(todayAssignments).length}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        {!gameOver && !gameWon && (
          <button
            onClick={onNextDay}
            disabled={!hasAssignments}
            className="font-semibold px-6 py-3 rounded-lg transition-colors shadow-md text-white"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              backgroundColor: hasAssignments ? '#EC6428' : '#6E6F70',
              cursor: hasAssignments ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (hasAssignments) {
                e.target.style.backgroundColor = '#D85A20';
              }
            }}
            onMouseLeave={(e) => {
              if (hasAssignments) {
                e.target.style.backgroundColor = '#EC6428';
              }
            }}
          >
            Следующий день
          </button>
        )}

        <button
          onClick={onReset}
          className="font-semibold px-6 py-3 rounded-lg transition-colors"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            backgroundColor: '#6E6F70',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5A5B5C';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6E6F70';
          }}
        >
          Новая игра
        </button>
      </div>

      {gameOver && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Игра окончена!</strong> Бюджет превышен.
        </div>
      )}

      {gameWon && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Поздравляем!</strong> Все задачи выполнены в рамках бюджета!
        </div>
      )}
    </div>
  );
};

export default GameControls;
