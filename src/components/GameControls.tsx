import React from 'react';

interface GameControlsProps {
  onNextDay: () => void;
  onNewGame: () => void;
  onAutoDistribute: () => void;
  onConvertCapacity: (amount: number) => void;
  availableRD: number;
  availableLab: number;
}

const GameControls = ({
  onNextDay,
  onNewGame,
  onAutoDistribute,
  onConvertCapacity,
  availableRD,
  availableLab,
}: GameControlsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #EC6428' }}>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
          🎮 Управление
        </h2>
        <p className="text-sm text-gray-600">
          Используйте capacity на карточках задач, затем нажмите "Следующий день"
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onNextDay}
            className="font-semibold px-6 py-3 rounded-lg transition-colors shadow-md text-white flex-1"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              backgroundColor: '#EC6428',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D85A20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EC6428';
            }}
          >
            ⏭️ Следующий день
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof onNewGame === 'function') {
                onNewGame();
              }
            }}
            className="font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              backgroundColor: '#6E6F70',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5A5B5C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6E6F70';
            }}
          >
            🆕 Новая игра
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAutoDistribute}
            className="font-semibold px-4 py-2 rounded-lg transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600"
          >
            ⚡ Автораспределение
          </button>

          <button
            onClick={() => onConvertCapacity(1)}
            disabled={availableRD < 2}
            className="font-semibold px-4 py-2 rounded-lg transition-colors text-sm bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Конвертировать 2 RD в 1 Lab"
          >
            🔄 2 RD → 1 Lab
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;

