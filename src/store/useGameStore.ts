// Zustand store для Professional Construction Kanban Engine
// Полностью переписанная версия с правильной логикой

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ITask,
  IGameState,
  IHistoryEntry,
  IEvent,
  EventType,
  TaskType,
  COLUMNS,
  TASK_ARCHETYPES,
  INITIAL_MONEY,
  DAILY_OVERHEAD,
  REVENUE_ACCEPTANCE,
  REVENUE_DONE,
  PENALTY_PER_DAY,
  CURING_DAYS,
  EVENT_PROBABILITY,
  EVENTS,
  generateInitialTasks,
  randomInt,
} from '../types';

// Генерация очков capacity (бросок кубиков)
const rollDice = (): number => Math.floor(Math.random() * 6) + 1;

// Генерация capacity для дня
const generateDailyCapacity = () => {
  return {
    rd: rollDice() * 3, // 3-18
    geo: rollDice() * 2, // 2-12
    smr: rollDice() * 3, // 3-18
    lab: rollDice() * 2, // 2-12
    hse: 2, // Всегда 2
  };
};

// Проверка зависимостей
const checkDependency = (task: ITask, allTasks: ITask[]): boolean => {
  if (!task.dependency) return true;
  
  const { type, sectionID } = task.dependency;
  
  // Ищем зависимую задачу
  const prerequisite = allTasks.find(t => {
    if (t.type !== type) return false;
    if (sectionID && t.sectionID !== sectionID) return false;
    return t.columnId === 'acceptance' || t.columnId === 'done';
  });
  
  return !!prerequisite;
};

// Генерация случайного события
const generateRandomEvent = (tasks: ITask[]): IEvent | null => {
  if (Math.random() > EVENT_PROBABILITY) return null;
  
  const eventTypes: EventType[] = [
    'heavy_rain',
    'design_error',
    'safety_violation',
    'equipment_bonus',
    'urgent_visit',
  ];
  
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const event = EVENTS[eventType];
  
  let effect: IEvent['effect'] = {};
  
  switch (eventType) {
    case 'design_error':
    case 'safety_violation': {
      const smrTasks = tasks.filter(t => t.columnId === 'smr' && !t.isBlocked);
      if (smrTasks.length > 0) {
        const randomTask = smrTasks[Math.floor(Math.random() * smrTasks.length)];
        effect.blockedTaskId = randomTask.id;
      }
      break;
    }
    case 'urgent_visit': {
      const availableTasks = tasks.filter(
        t => t.columnId !== 'done' && t.columnId !== 'expedite' && t.status !== 'expedite'
      );
      if (availableTasks.length > 0) {
        const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        effect.expediteTaskId = randomTask.id;
      }
      break;
    }
    case 'equipment_bonus':
      effect.smrBonus = 5;
      break;
    case 'heavy_rain':
      effect.smrCapacityReduction = 0.8;
      break;
  }
  
  return {
    id: `event-${Date.now()}-${Math.random()}`,
    type: eventType,
    day: 0, // Будет установлен при применении
    description: event.description,
    effect,
  };
};

// Функция для создания начального состояния
const createInitialState = (): IGameState & { totalRevenue: number; totalCosts: number } => {
  const initialTasks = generateInitialTasks();
  const initialCapacity = generateDailyCapacity();
  
  return {
    tasks: initialTasks,
    day: 0,
    money: INITIAL_MONEY,
    capacity: initialCapacity,
    history: [
      {
        day: 0,
        money: INITIAL_MONEY,
        revenue: 0,
        costs: 0,
        profit: 0,
        columnDistribution: COLUMNS.reduce((acc, col) => {
          acc[col.id] = initialTasks.filter(t => t.columnId === col.id).length;
          return acc;
        }, {} as Record<string, number>),
      },
    ],
    events: [],
    gameOver: false,
    gameWon: false,
    totalRevenue: 0,
    totalCosts: 0,
  };
};

interface GameStore extends IGameState {
  // Actions
  nextDay: () => void;
  spendCapacity: (taskId: string, capacityType: 'rd' | 'geo' | 'smr' | 'lab' | 'hse', amount: number) => boolean;
  moveTask: (taskId: string, newColumnId: string, newSubColumn?: 'Doing' | 'Ready') => void;
  autoDistributeCapacity: () => void;
  unblockTask: (taskId: string, capacityType: 'rd' | 'hse', amount: number) => boolean;
  convertCapacity: (from: 'rd', to: 'lab', amount: number) => boolean;
  newGame: () => void;
  startGame: () => void;
  clearHistory: () => void;
  totalRevenue: number;
  totalCosts: number;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      // Начальное состояние
      const initialState = createInitialState();
      
      return {
        ...initialState,
        
        // Next Day
        nextDay: () => {
          const state = get();
          if (state.gameOver || state.gameWon) return;
          
          let { tasks, day, money, capacity, history, events, totalRevenue, totalCosts } = state;
          let dayRevenue = 0;
          let dayCosts = DAILY_OVERHEAD;
          
          // Генерируем новую capacity
          const newCapacity = generateDailyCapacity();
          
          // Генерируем событие
          const event = generateRandomEvent(tasks);
          if (event) {
            event.day = day + 1;
            events = [...events, event];
            
            // Применяем эффекты события
            if (event.effect) {
              if (event.effect.blockedTaskId) {
                tasks = tasks.map(t => {
                  if (t.id === event.effect!.blockedTaskId) {
                    return {
                      ...t,
                      isBlocked: true,
                      blockType: event.type === 'design_error' ? 'design_error' : 'safety_violation',
                    };
                  }
                  return t;
                });
              }
              
              if (event.effect.expediteTaskId) {
                tasks = tasks.map(t => {
                  if (t.id === event.effect!.expediteTaskId) {
                    return { ...t, columnId: 'expedite', status: 'expedite' };
                  }
                  return t;
                });
              }
              
              if (event.effect.smrBonus) {
                newCapacity.smr += event.effect.smrBonus;
              }
              
              if (event.effect.smrCapacityReduction) {
                newCapacity.smr = Math.floor(newCapacity.smr * (1 - event.effect.smrCapacityReduction));
              }
            }
          }
          
          // Списываем накладные расходы
          money -= DAILY_OVERHEAD;
          
          // Проверяем штрафы за просроченные задачи
          tasks.forEach(task => {
            if (task.fixedDate && task.columnId !== 'done' && day + 1 > task.fixedDate) {
              const daysLate = day + 1 - task.fixedDate;
              const penalty = PENALTY_PER_DAY * daysLate;
              money -= penalty;
              dayCosts += penalty;
            }
          });
          
          // Обновляем curing дни
          tasks = tasks.map(task => {
            if (task.status === 'curing' && task.curingDays !== undefined) {
              const newCuringDays = task.curingDays - 1;
              if (newCuringDays <= 0) {
                return { 
                  ...task, 
                  curingDays: 0, 
                  status: 'normal',
                  columnId: 'lab',
                  subColumn: 'Ready',
                };
              }
              return { ...task, curingDays: newCuringDays };
            }
            return task;
          });
          
          // Перемещаем задачи из backlog в RD Ready (если нет зависимостей)
          tasks = tasks.map(task => {
            if (task.columnId === 'backlog' && checkDependency(task, tasks)) {
              return { ...task, columnId: 'rd', subColumn: 'Ready' as const };
            }
            return task;
          });
          
          // Автоматически перемещаем задачи из Ready в Doing, если есть capacity и место в WIP
          tasks = tasks.map(task => {
            if (task.subColumn === 'Ready' && 
                task.columnId !== 'backlog' && 
                task.columnId !== 'acceptance' && 
                task.columnId !== 'done' && 
                task.columnId !== 'expedite' &&
                !task.isBlocked &&
                task.status !== 'curing') {
              const column = COLUMNS.find(c => c.id === task.columnId);
              if (column && column.wipLimit !== null) {
                const doingTasks = tasks.filter(
                  t => t.columnId === task.columnId && t.subColumn === 'Doing'
                ).length;
                if (doingTasks < column.wipLimit) {
                  return { ...task, subColumn: 'Doing' as const };
                }
              }
            }
            return task;
          });
          
          // Проверяем завершенные сегменты и перемещаем задачи
          tasks = tasks.map(task => {
            if (task.status === 'curing') return task;
            if (task.subColumn !== 'Doing') return task;
            
            const column = task.columnId;
            const progressKey = column as keyof ITask['progress'];
            
            // Если текущий сегмент завершен
            if (task.progress[progressKey] <= 0) {
              const columnOrder = ['rd', 'geo', 'smr', 'lab', 'acceptance', 'done'];
              const currentIndex = columnOrder.indexOf(column);
              
              if (currentIndex < columnOrder.length - 1) {
                const nextColumn = columnOrder[currentIndex + 1];
                
                // Если завершен SMR для bridge_pier, переходим в curing
                if (column === 'smr' && task.type === 'bridge_pier') {
                  return {
                    ...task,
                    columnId: 'smr',
                    status: 'curing',
                    curingDays: CURING_DAYS,
                    subColumn: 'Ready' as const,
                  };
                }
                
                // Проверяем зависимости перед переходом
                if (nextColumn === 'acceptance' || checkDependency(task, tasks)) {
                  let newTask = {
                    ...task,
                    columnId: nextColumn,
                    subColumn: 'Ready' as const,
                  };
                  
                  // Если переходим в acceptance, добавляем доход
                  if (nextColumn === 'acceptance') {
                    money += task.revenueOnAcceptance;
                    dayRevenue += task.revenueOnAcceptance;
                  }
                  
                  // Если переходим в done, добавляем доход
                  if (nextColumn === 'done') {
                    money += task.revenueOnDone;
                    dayRevenue += task.revenueOnDone;
                    newTask = { ...newTask, completedAt: day + 1 };
                  }
                  
                  return newTask;
                }
              }
            }
            
            return task;
          });
          
          // Проверяем победу
          const allDone = tasks.every(t => t.columnId === 'done');
          const gameWon = allDone && money > 0;
          
          // Проверяем банкротство
          const gameOver = money <= 0;
          
          // Обновляем историю
          totalRevenue += dayRevenue;
          totalCosts += dayCosts;
          
          const newHistoryEntry: IHistoryEntry = {
            day: day + 1,
            money,
            revenue: totalRevenue,
            costs: totalCosts,
            profit: totalRevenue - totalCosts,
            columnDistribution: COLUMNS.reduce((acc, col) => {
              acc[col.id] = tasks.filter(t => t.columnId === col.id).length;
              return acc;
            }, {} as Record<string, number>),
          };
          
          set({
            tasks,
            day: day + 1,
            money,
            capacity: newCapacity,
            history: [...history, newHistoryEntry],
            events,
            gameOver,
            gameWon,
            totalRevenue,
            totalCosts,
          });
        },
        
        // Spend Capacity
        spendCapacity: (taskId: string, capacityType: 'rd' | 'geo' | 'smr' | 'lab' | 'hse', amount: number) => {
          const state = get();
          const { tasks, capacity } = state;
          
          if (capacity[capacityType] < amount) return false;
          
          const task = tasks.find(t => t.id === taskId);
          if (!task) return false;
          
          // Проверяем, что задача в правильной колонке
          const expectedColumn = capacityType === 'rd' ? 'rd' : 
                                capacityType === 'geo' ? 'geo' :
                                capacityType === 'smr' ? 'smr' :
                                capacityType === 'lab' ? 'lab' : null;
          
          if (expectedColumn && task.columnId !== expectedColumn) return false;
          if (task.subColumn !== 'Doing') return false;
          if (task.isBlocked) return false;
          if (task.status === 'curing') return false;
          
          // Списываем capacity
          const newCapacity = { ...capacity, [capacityType]: capacity[capacityType] - amount };
          
          // Уменьшаем прогресс
          const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                progress: {
                  ...t.progress,
                  [capacityType]: Math.max(0, t.progress[capacityType] - amount),
                },
              };
            }
            return t;
          });
          
          set({ capacity: newCapacity, tasks: updatedTasks });
          return true;
        },
        
        // Move Task
        moveTask: (taskId: string, newColumnId: string, newSubColumn?: 'Doing' | 'Ready') => {
          const state = get();
          const { tasks } = state;
          
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;
          
          // Проверяем Pull логику
          if (task.subColumn !== 'Ready') return;
          
          const newColumn = COLUMNS.find(c => c.id === newColumnId);
          if (!newColumn) return;
          
          // Проверяем WIP limit
          if (newColumn.wipLimit !== null) {
            const doingTasks = tasks.filter(
              t => t.columnId === newColumnId && t.subColumn === 'Doing'
            ).length;
            if (doingTasks >= newColumn.wipLimit) return;
          }
          
          // Проверяем зависимости
          if (!checkDependency(task, tasks)) return;
          
          const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                columnId: newColumnId,
                subColumn: newSubColumn || (newColumn.hasSubColumns ? 'Ready' : 'Ready'),
              };
            }
            return t;
          });
          
          set({ tasks: updatedTasks });
        },
        
        // Auto Distribute Capacity
        autoDistributeCapacity: () => {
          const state = get();
          const { tasks, capacity } = state;
          
          // Сортируем задачи справа налево (ближе к Done = выше приоритет)
          const columnOrder = ['rd', 'geo', 'smr', 'lab'];
          const doingTasks = tasks
            .filter(t => t.subColumn === 'Doing' && !t.isBlocked && columnOrder.includes(t.columnId) && t.status !== 'curing')
            .sort((a, b) => {
              const aIndex = columnOrder.indexOf(a.columnId);
              const bIndex = columnOrder.indexOf(b.columnId);
              return bIndex - aIndex; // Справа налево
            });
          
          let remainingCapacity = { ...capacity };
          
          doingTasks.forEach(task => {
            const column = task.columnId as 'rd' | 'geo' | 'smr' | 'lab';
            const needed = task.progress[column];
            const available = remainingCapacity[column];
            const toSpend = Math.min(needed, available);
            
            if (toSpend > 0) {
              const success = get().spendCapacity(task.id, column, toSpend);
              if (success) {
                remainingCapacity[column] -= toSpend;
              }
            }
          });
        },
        
        // Unblock Task
        unblockTask: (taskId: string, capacityType: 'rd' | 'hse', amount: number) => {
          const state = get();
          const { tasks, capacity } = state;
          
          if (capacity[capacityType] < amount) return false;
          
          const task = tasks.find(t => t.id === taskId);
          if (!task || !task.isBlocked) return false;
          
          // Проверяем тип блокировки
          if (task.blockType === 'design_error' && capacityType !== 'rd') return false;
          if (task.blockType === 'safety_violation' && capacityType !== 'hse') return false;
          
          const requiredAmount = task.blockType === 'design_error' ? 5 : 2;
          if (amount < requiredAmount) return false;
          
          // Списываем capacity
          const newCapacity = { ...capacity, [capacityType]: capacity[capacityType] - amount };
          
          // Разблокируем задачу
          const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                isBlocked: false,
                blockType: undefined,
              };
            }
            return t;
          });
          
          set({ capacity: newCapacity, tasks: updatedTasks });
          return true;
        },
        
        // Convert Capacity (2 RD = 1 Lab)
        convertCapacity: (from: 'rd', to: 'lab', amount: number) => {
          const state = get();
          const { capacity } = state;
          
          if (from !== 'rd' || to !== 'lab') return false;
          if (capacity.rd < amount * 2) return false;
          
          const newCapacity = {
            ...capacity,
            rd: capacity.rd - amount * 2,
            lab: capacity.lab + amount,
          };
          
          set({ capacity: newCapacity });
          return true;
        },
        
        // New Game / Start Game
        newGame: () => {
          try {
            const newState = createInitialState();
            
            // Очищаем localStorage перед установкой нового состояния
            localStorage.removeItem('kanban-game-storage');
            
            // Используем set с полным обновлением состояния
            set(newState);
            
            // Принудительно обновляем localStorage
            setTimeout(() => {
              try {
                const storage = createJSONStorage(() => localStorage);
                storage.setItem('kanban-game-storage', JSON.stringify({ state: newState, version: 0 }));
              } catch (error) {
                console.error('Error saving to localStorage:', error);
              }
            }, 100);
          } catch (error) {
            console.error('Error in newGame:', error);
            alert('Ошибка при создании новой игры: ' + error.message);
          }
        },
        
        // Start Game (алиас)
        startGame: () => {
          get().newGame();
        },
        
        // Clear History
        clearHistory: () => {
          set({ history: [] });
        },
      };
    },
    {
      name: 'kanban-game-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating store:', error);
          localStorage.removeItem('kanban-game-storage');
          // Создаем начальное состояние при ошибке
          setTimeout(() => {
            useGameStore.setState(createInitialState());
          }, 0);
          return;
        }
        if (state) {
          // Если состояние пустое или некорректное, инициализируем заново
          if (!state.tasks || state.tasks.length === 0 || 
              state.money === undefined || state.money === null || 
              isNaN(state.money) || state.money === 0) {
            const newState = createInitialState();
            // Используем setTimeout для обновления состояния после rehydration
            setTimeout(() => {
              useGameStore.setState(newState);
            }, 0);
          }
        } else {
          // Если state вообще нет, создаем начальное состояние
          const newState = createInitialState();
          setTimeout(() => {
            useGameStore.setState(newState);
          }, 0);
        }
      },
    }
  )
);

