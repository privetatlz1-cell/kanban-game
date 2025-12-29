import React, { useState, useEffect } from 'react';
import { useGameStore } from './store.ts';
import KanbanBoard from './components/KanbanBoard';
import CapacityPanel from './components/CapacityPanel.tsx';
import EventsPanel from './components/EventsPanel.tsx';
import BudgetDisplay from './components/BudgetDisplay';
import GameControls from './components/GameControls';
import MetricsCharts from './components/MetricsCharts';
import Logo from './components/Logo';
import { formatCurrency } from './types.ts';

const KanbanGame = () => {
  const {
    tasks = [],
    day = 0,
    money = 0,
    capacity,
    history = [],
    events = [],
    gameOver = false,
    gameWon = false,
    nextDay,
    autoDistributeCapacity,
    convertCapacity,
    newGame,
  } = useGameStore();
  
  const [showAutoDistribute, setShowAutoDistribute] = useState(false);
  
  // Проверяем и инициализируем игру при монтировании, если нужно
  useEffect(() => {
    // Даем время на rehydration из localStorage
    const checkState = setTimeout(() => {
      const currentState = useGameStore.getState();
      // Если задач нет или бюджет равен 0, инициализируем игру
      if ((!currentState.tasks || currentState.tasks.length === 0 || 
           currentState.money === 0 || currentState.money === undefined) && 
          !currentState.gameOver && !currentState.gameWon) {
        console.log('Initializing game: tasks=', currentState.tasks?.length, 'money=', currentState.money);
        currentState.newGame();
      }
    }, 200); // Даем время на rehydration
    
    return () => clearTimeout(checkState);
  }, []); // Только при монтировании
  
  const handleNextDay = () => {
    nextDay();
    setShowAutoDistribute(false);
  };
  
  const handleAutoDistribute = () => {
    autoDistributeCapacity();
    setShowAutoDistribute(true);
  };
  
  const handleNewGame = () => {
    if (typeof newGame === 'function') {
      try {
        newGame();
      } catch (error) {
        console.error('Error in newGame:', error);
        alert('Ошибка при создании новой игры: ' + error.message);
      }
    }
  };
  
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">💸 Банкротство</h2>
          <p className="text-gray-600 mb-4">Деньги закончились. Проект остановлен.</p>
          <p className="text-lg font-semibold mb-6">День: {day}</p>
          <button
            onClick={newGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Новая игра
          </button>
        </div>
      </div>
    );
  }
  
  if (gameWon) {
    const totalProfit = money - 50000; // INITIAL_MONEY
    const totalRevenue = history.reduce((sum, h) => sum + (h.revenue || 0), 0);
    const totalCosts = history.reduce((sum, h) => sum + (h.costs || 0), 0);
    
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Победа!</h2>
          <p className="text-gray-600 mb-4">Все задачи выполнены!</p>
          <div className="space-y-2 mb-6 text-left">
            <p className="text-lg"><strong>День:</strong> {day}</p>
            <p className="text-lg"><strong>Остаток средств:</strong> {formatCurrency(money)}</p>
            <p className="text-lg"><strong>Общая прибыль:</strong> {formatCurrency(totalProfit)}</p>
            <p className="text-lg"><strong>Доходы:</strong> {formatCurrency(totalRevenue)}</p>
            <p className="text-lg"><strong>Расходы:</strong> {formatCurrency(totalCosts)}</p>
          </div>
          <button
            onClick={newGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Новая игра
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Logo size="default" />
        </div>
        
        {/* Budget and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <BudgetDisplay money={money} day={day} />
          <GameControls
            onNextDay={handleNextDay}
            onNewGame={handleNewGame}
            onAutoDistribute={handleAutoDistribute}
            onConvertCapacity={(amount) => convertCapacity('rd', 'lab', amount)}
            availableRD={capacity.rd}
            availableLab={capacity.lab}
          />
        </div>
        
        {/* Capacity Panel */}
        <CapacityPanel capacity={capacity} />
        
        {/* Specialists Panel - для новой модели не нужен, но оставим для совместимости */}
        
        {/* Events Panel */}
        {events.length > 0 && <EventsPanel events={events} />}
        
        {/* Kanban Board */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Kanban Доска</h2>
          <KanbanBoard />
        </div>
        
        {/* Metrics */}
        <MetricsCharts history={history} tasks={tasks} />
      </div>
    </div>
  );
};

export default KanbanGame;
