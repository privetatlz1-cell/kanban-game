// Типы и константы для Kanban игры - Professional Construction Engine

export interface ITask {
  id: string;
  title: string;
  type: TaskType;
  sectionID?: string; // Для группировки зависимых задач (например, участок дороги)
  
  // Мультисегментный прогресс
  progress: {
    rd: number;      // Рабочая документация (осталось)
    geo: number;     // Геодезические проверки (осталось)
    smr: number;     // Строительно-монтажные работы (осталось)
    lab: number;     // Лабораторные испытания (осталось)
  };
  
  // Исходные требования
  requirements: {
    rd: number;
    geo: number;
    smr: number;
    lab: number;
  };
  
  columnId: string;
  subColumn: 'Doing' | 'Ready'; // Подколонка внутри колонки
  
  // Зависимости
  dependency?: {
    type: 'road_earthwork' | 'bridge_pier';
    sectionID?: string;
  };
  
  // Статусы
  isBlocked: boolean;
  blockType?: 'design_error' | 'safety_violation';
  curingDays?: number; // Для мостовых опор (3 дня после SMR)
  status?: 'normal' | 'curing' | 'expedite';
  
  // Финансы
  fixedDate?: number; // День, к которому задача должна быть выполнена
  revenueOnAcceptance: number; // +5000 при переходе в Acceptance
  revenueOnDone: number; // +10000 при переходе в Done
  
  // Метаданные
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export type TaskType = 'road_earthwork' | 'road_asphalt' | 'bridge_pier' | 'bridge_span';

export interface IGameState {
  tasks: ITask[];
  day: number;
  money: number;
  capacity: {
    rd: number;
    geo: number;
    smr: number;
    lab: number;
    hse: number; // Всегда 2
  };
  history: IHistoryEntry[];
  events: IEvent[];
  gameOver: boolean;
  gameWon: boolean;
}

export interface IHistoryEntry {
  day: number;
  money: number;
  revenue: number;
  costs: number;
  profit: number;
  columnDistribution: Record<string, number>;
}

export interface IEvent {
  id: string;
  type: EventType;
  day: number;
  description: string;
  effect?: {
    smrCapacityReduction?: number; // 0.8 для Heavy Rain
    blockedTaskId?: string;
    smrBonus?: number; // +5 для Equipment Bonus
    expediteTaskId?: string;
  };
}

export type EventType = 
  | 'heavy_rain' 
  | 'design_error' 
  | 'safety_violation' 
  | 'equipment_bonus' 
  | 'urgent_visit';

// Определения типов задач (Task Archetypes)
export const TASK_ARCHETYPES = {
  road_earthwork: {
    id: 'road_earthwork',
    name: 'Дорога (Земляные работы)',
    requirements: { rd: 2, geo: 4, smr: 10, lab: 8 },
    dependency: null,
    special: null,
  },
  road_asphalt: {
    id: 'road_asphalt',
    name: 'Дорога (Асфальт)',
    requirements: { rd: 1, geo: 2, smr: 15, lab: 12 },
    dependency: { type: 'road_earthwork' as const },
    special: null,
  },
  bridge_pier: {
    id: 'bridge_pier',
    name: 'Мост (Опоры)',
    requirements: { rd: 5, geo: 3, smr: 20, lab: 10 },
    dependency: null,
    special: 'curing' as const, // 3 дня после завершения SMR
  },
  bridge_span: {
    id: 'bridge_span',
    name: 'Мост (Пролётное строение)',
    requirements: { rd: 4, geo: 5, smr: 25, lab: 15 },
    dependency: { type: 'bridge_pier' as const },
    special: null,
  },
};

// Колонки Kanban с подколонками
export const COLUMNS = [
  { 
    id: 'backlog', 
    name: 'Бэклог', 
    order: 0, 
    wipLimit: null,
    hasSubColumns: false,
  },
  { 
    id: 'rd', 
    name: 'Рабочая документация', 
    order: 1, 
    wipLimit: 3,
    hasSubColumns: true,
  },
  { 
    id: 'geo', 
    name: 'Геодезические проверки', 
    order: 2, 
    wipLimit: 3,
    hasSubColumns: true,
  },
  { 
    id: 'smr', 
    name: 'Строительно-монтажные работы', 
    order: 3, 
    wipLimit: 3,
    hasSubColumns: true,
  },
  { 
    id: 'lab', 
    name: 'Лабораторные испытания', 
    order: 4, 
    wipLimit: 3,
    hasSubColumns: true,
  },
  { 
    id: 'acceptance', 
    name: 'Приёмка', 
    order: 5, 
    wipLimit: null,
    hasSubColumns: false,
  },
  { 
    id: 'done', 
    name: 'Сдано', 
    order: 6, 
    wipLimit: null,
    hasSubColumns: false,
  },
  { 
    id: 'expedite', 
    name: 'Срочно', 
    order: -1, // Отдельная полоса сверху
    wipLimit: null,
    hasSubColumns: false,
  },
];

// Экономические константы
export const INITIAL_MONEY = 50000;
export const DAILY_OVERHEAD = 500;
export const REVENUE_ACCEPTANCE = 5000;
export const REVENUE_DONE = 10000;
export const PENALTY_PER_DAY = 2000;
export const CURING_DAYS = 3;

// Вероятность события
export const EVENT_PROBABILITY = 0.3; // 30%

// События
export const EVENTS: Record<EventType, { name: string; description: string }> = {
  heavy_rain: {
    name: 'Сильный дождь',
    description: 'Производительность SMR снижена на 80% на сегодня',
  },
  design_error: {
    name: 'Ошибка проектирования',
    description: 'Случайная задача в SMR заблокирована. Требуется 5 RD для разблокировки',
  },
  safety_violation: {
    name: 'Нарушение безопасности',
    description: 'Случайная задача в SMR заблокирована. Требуется 2 HSE для разблокировки',
  },
  equipment_bonus: {
    name: 'Бонус оборудования',
    description: '+5 SMR очков на сегодня',
  },
  urgent_visit: {
    name: 'Срочный визит',
    description: 'Случайная задача перемещена в срочную полосу',
  },
};

// Утилиты
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return `${Number(value).toLocaleString('ru-RU')}`;
};

// Для отображения денег с символом валюты (если нужно)
export const formatMoney = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return `${Number(value).toLocaleString('ru-RU')}`;
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return Number(value).toLocaleString('ru-RU');
};

// Генерация случайного числа
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Генерация начальных задач
export const generateInitialTasks = (): ITask[] => {
  const tasks: ITask[] = [];
  const sections = ['A', 'B', 'C', 'D'];
  
  // Генерируем задачи для каждой секции
  sections.forEach((section, idx) => {
    // Road Earthwork (базовая, без зависимостей)
    tasks.push({
      id: `task-road-earthwork-${section}`,
      title: `Дорога: Земляные работы (Участок ${section})`,
      type: 'road_earthwork',
      sectionID: section,
      progress: {
        rd: TASK_ARCHETYPES.road_earthwork.requirements.rd,
        geo: TASK_ARCHETYPES.road_earthwork.requirements.geo,
        smr: TASK_ARCHETYPES.road_earthwork.requirements.smr,
        lab: TASK_ARCHETYPES.road_earthwork.requirements.lab,
      },
      requirements: TASK_ARCHETYPES.road_earthwork.requirements,
      columnId: 'backlog',
      subColumn: 'Ready',
      dependency: null,
      isBlocked: false,
      revenueOnAcceptance: REVENUE_ACCEPTANCE,
      revenueOnDone: REVENUE_DONE,
      createdAt: 0,
      status: 'normal',
    });
    
    // Road Asphalt (зависит от Road Earthwork)
    tasks.push({
      id: `task-road-asphalt-${section}`,
      title: `Дорога: Асфальт (Участок ${section})`,
      type: 'road_asphalt',
      sectionID: section,
      progress: {
        rd: TASK_ARCHETYPES.road_asphalt.requirements.rd,
        geo: TASK_ARCHETYPES.road_asphalt.requirements.geo,
        smr: TASK_ARCHETYPES.road_asphalt.requirements.smr,
        lab: TASK_ARCHETYPES.road_asphalt.requirements.lab,
      },
      requirements: TASK_ARCHETYPES.road_asphalt.requirements,
      columnId: 'backlog',
      subColumn: 'Ready',
      dependency: { type: 'road_earthwork', sectionID: section },
      isBlocked: false,
      revenueOnAcceptance: REVENUE_ACCEPTANCE,
      revenueOnDone: REVENUE_DONE,
      createdAt: 0,
      status: 'normal',
    });
  });
  
  // Bridge Pier (базовая, без зависимостей)
  tasks.push({
    id: 'task-bridge-pier-1',
    title: 'Мост: Опоры (Пролёт 1)',
    type: 'bridge_pier',
    sectionID: 'P1',
    progress: {
      rd: TASK_ARCHETYPES.bridge_pier.requirements.rd,
      geo: TASK_ARCHETYPES.bridge_pier.requirements.geo,
      smr: TASK_ARCHETYPES.bridge_pier.requirements.smr,
      lab: TASK_ARCHETYPES.bridge_pier.requirements.lab,
    },
    requirements: TASK_ARCHETYPES.bridge_pier.requirements,
    columnId: 'backlog',
    subColumn: 'Ready',
    dependency: null,
    isBlocked: false,
    revenueOnAcceptance: REVENUE_ACCEPTANCE,
    revenueOnDone: REVENUE_DONE,
    createdAt: 0,
    status: 'normal',
  });
  
  // Bridge Span (зависит от Bridge Pier)
  tasks.push({
    id: 'task-bridge-span-1',
    title: 'Мост: Пролётное строение (Пролёт 1)',
    type: 'bridge_span',
    sectionID: 'P1',
    progress: {
      rd: TASK_ARCHETYPES.bridge_span.requirements.rd,
      geo: TASK_ARCHETYPES.bridge_span.requirements.geo,
      smr: TASK_ARCHETYPES.bridge_span.requirements.smr,
      lab: TASK_ARCHETYPES.bridge_span.requirements.lab,
    },
    requirements: TASK_ARCHETYPES.bridge_span.requirements,
    columnId: 'backlog',
    subColumn: 'Ready',
    dependency: { type: 'bridge_pier', sectionID: 'P1' },
    isBlocked: false,
    revenueOnAcceptance: REVENUE_ACCEPTANCE,
    revenueOnDone: REVENUE_DONE,
    createdAt: 0,
    status: 'normal',
  });
  
  return tasks;
};

// ===== Обратная совместимость со старой моделью =====

// Специалисты (для обратной совместимости)
export const SPECIALISTS = {
  DESIGN_ENGINEER: {
    id: 'design_engineer',
    name: 'Инженер-проектировщик',
    shortName: 'Проектировщик',
    count: 3,
    color: '#3B82F6',
    icon: '📐',
    primaryColumn: 'rd',
  },
  EXECUTIVE_ENGINEER: {
    id: 'executive_engineer',
    name: 'Инженер ИД',
    shortName: 'ИД',
    count: 2,
    color: '#A855F7',
    icon: '📋',
    primaryColumn: 'lab',
  },
  QUALITY_ENGINEER: {
    id: 'quality_engineer',
    name: 'Инженер по качеству',
    shortName: 'Качество',
    count: 3,
    color: '#EF4444',
    icon: '🔍',
    primaryColumn: 'lab',
  },
  SURVEYOR: {
    id: 'surveyor',
    name: 'Геодезист',
    shortName: 'Геодезист',
    count: 2,
    color: '#F97316',
    icon: '📏',
    primaryColumn: 'geo',
  },
  FOREMAN: {
    id: 'foreman',
    name: 'Прораб',
    shortName: 'Прораб',
    count: 4,
    color: '#10B981',
    icon: '👷',
    primaryColumn: 'smr',
  },
  SAFETY_OFFICER: {
    id: 'safety_officer',
    name: 'Инженер по ОТ',
    shortName: 'ОТ',
    count: 1,
    color: '#6B7280',
    icon: '🦺',
    primaryColumn: null,
  },
};

// Типы задач (для обратной совместимости)
export const TASK_TYPES = {
  UTILITIES: {
    id: 'utilities',
    name: 'Перекладка инженерных сетей',
    description: 'Газ, водопровод, теплосеть, кабельные линии, сети связи, ливневая канализация',
    icon: '🔧',
  },
  EARTHWORK: {
    id: 'earthwork',
    name: 'Устройство земляного полотна',
    description: 'Подготовка и уплотнение грунта',
    icon: '🏗️',
  },
  PAVEMENT: {
    id: 'pavement',
    name: 'Устройство дорожной одежды',
    description: 'Укладка асфальтобетона, разметка',
    icon: '🛣️',
  },
  BRIDGE: {
    id: 'bridge',
    name: 'Строительство мостовых сооружений',
    description: 'Возведение опор, пролётных строений',
    icon: '🌉',
  },
};

// Подрядчики (для обратной совместимости)
export const CONTRACTORS: Record<string, Array<{
  id: string;
  name: string;
  description: string;
  speedMultiplier: number;
  costMultiplier: number;
  icon: string;
  color: string;
}>> = {
  utilities: [
    {
      id: 'utilities_premium',
      name: 'ООО "СтройТехПремиум"',
      description: 'Премиум-подрядчик: быстро, качественно, дорого',
      speedMultiplier: 2.0,
      costMultiplier: 1.5,
      icon: '⚡',
      color: '#10B981',
    },
    {
      id: 'utilities_standard',
      name: 'ООО "ИнжСтройСтандарт"',
      description: 'Стандартный подрядчик: средняя скорость и цена',
      speedMultiplier: 1.0,
      costMultiplier: 1.0,
      icon: '⚖️',
      color: '#3B82F6',
    },
    {
      id: 'utilities_budget',
      name: 'ООО "ЭкономСтрой"',
      description: 'Бюджетный подрядчик: медленно, но дешево',
      speedMultiplier: 0.6,
      costMultiplier: 0.7,
      icon: '💰',
      color: '#F59E0B',
    },
  ],
  earthwork: [
    {
      id: 'earthwork_premium',
      name: 'ООО "ЗемСтройЭкспресс"',
      description: 'Премиум-подрядчик: быстро, качественно, дорого',
      speedMultiplier: 2.0,
      costMultiplier: 1.5,
      icon: '⚡',
      color: '#10B981',
    },
    {
      id: 'earthwork_standard',
      name: 'ООО "ЗемСтройСтандарт"',
      description: 'Стандартный подрядчик: средняя скорость и цена',
      speedMultiplier: 1.0,
      costMultiplier: 1.0,
      icon: '⚖️',
      color: '#3B82F6',
    },
    {
      id: 'earthwork_budget',
      name: 'ООО "ЗемСтройЭконом"',
      description: 'Бюджетный подрядчик: медленно, но дешево',
      speedMultiplier: 0.6,
      costMultiplier: 0.7,
      icon: '💰',
      color: '#F59E0B',
    },
  ],
  pavement: [
    {
      id: 'pavement_premium',
      name: 'ООО "АсфальтПремиум"',
      description: 'Премиум-подрядчик: быстро, качественно, дорого',
      speedMultiplier: 2.0,
      costMultiplier: 1.5,
      icon: '⚡',
      color: '#10B981',
    },
    {
      id: 'pavement_standard',
      name: 'ООО "ДорСтройСтандарт"',
      description: 'Стандартный подрядчик: средняя скорость и цена',
      speedMultiplier: 1.0,
      costMultiplier: 1.0,
      icon: '⚖️',
      color: '#3B82F6',
    },
    {
      id: 'pavement_budget',
      name: 'ООО "ДорСтройЭконом"',
      description: 'Бюджетный подрядчик: медленно, но дешево',
      speedMultiplier: 0.6,
      costMultiplier: 0.7,
      icon: '💰',
      color: '#F59E0B',
    },
  ],
  bridge: [
    {
      id: 'bridge_premium',
      name: 'ООО "МостСтройЭлит"',
      description: 'Премиум-подрядчик: быстро, качественно, дорого',
      speedMultiplier: 2.0,
      costMultiplier: 1.5,
      icon: '⚡',
      color: '#10B981',
    },
    {
      id: 'bridge_standard',
      name: 'ООО "МостСтройСтандарт"',
      description: 'Стандартный подрядчик: средняя скорость и цена',
      speedMultiplier: 1.0,
      costMultiplier: 1.0,
      icon: '⚖️',
      color: '#3B82F6',
    },
    {
      id: 'bridge_budget',
      name: 'ООО "МостСтройЭконом"',
      description: 'Бюджетный подрядчик: медленно, но дешево',
      speedMultiplier: 0.6,
      costMultiplier: 0.7,
      icon: '💰',
      color: '#F59E0B',
    },
  ],
};

// Утилиты для работы с подрядчиками (для обратной совместимости)
export const getContractor = (contractorId: string) => {
  for (const taskType in CONTRACTORS) {
    const contractor = CONTRACTORS[taskType].find(c => c.id === contractorId);
    if (contractor) return contractor;
  }
  return null;
};

export const calculateTaskCost = (baseDirectCost: number, contractorId: string): number => {
  const contractor = getContractor(contractorId);
  if (!contractor) return baseDirectCost;
  return Math.round(baseDirectCost * contractor.costMultiplier);
};

export const calculateTaskRevenue = (baseRevenue: number, contractorId: string): number => {
  const contractor = getContractor(contractorId);
  if (!contractor) return baseRevenue;
  if (contractor.speedMultiplier >= 2.0) {
    return Math.round(baseRevenue * 1.1); // +10% за качество
  }
  return baseRevenue;
};

export const getTaskDirectCost = (task: any): number => {
  if (!task) return 0;
  const baseCost = task.baseDirectCost || task.directCost || 0;
  const contractor = getContractor(task.contractorId);
  if (contractor) {
    return Math.round(baseCost * contractor.costMultiplier);
  }
  return baseCost;
};

export const getTaskRevenue = (task: any): number => {
  if (!task) return 0;
  return task.baseRevenue || task.revenue || 0;
};

