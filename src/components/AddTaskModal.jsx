import React, { useState, useEffect } from 'react';
import { TASK_TYPES, CONTRACTORS, formatCurrency, calculateTaskCost, calculateTaskRevenue } from '../types';

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'utilities',
    workVolume: 5,
    directCost: 100000000,
    revenue: 150000000,
    contractorId: '',
  });

  // Обновляем подрядчика при смене типа задачи
  useEffect(() => {
    const contractors = CONTRACTORS[formData.type] || [];
    if (contractors.length > 0 && !formData.contractorId) {
      setFormData(prev => ({
        ...prev,
        contractorId: contractors[0].id,
      }));
    }
  }, [formData.type]);

  if (!isOpen) return null;

  // Динамически пересчитываем стоимость и доход с учетом подрядчика (для валидации)
  const baseDirectCostForValidation = formData.directCost;
  const baseRevenueForValidation = formData.revenue;
  const calculatedDirectCostForValidation = formData.contractorId 
    ? calculateTaskCost(baseDirectCostForValidation, formData.contractorId)
    : baseDirectCostForValidation;
  const calculatedRevenueForValidation = formData.contractorId
    ? calculateTaskRevenue(baseRevenueForValidation, formData.contractorId)
    : baseRevenueForValidation;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.workVolume || formData.workVolume < 2 || formData.workVolume > 10) {
      alert('Заполните название задачи и укажите объём работ от 2 до 10');
      return;
    }
    if (!formData.contractorId) {
      alert('Выберите подрядчика');
      return;
    }
    if (calculatedRevenueForValidation <= calculatedDirectCostForValidation) {
      alert('Доход должен быть больше расходов с учетом выбранного подрядчика');
      return;
    }
    onAddTask({
      title: formData.title,
      type: formData.type,
      workVolume: formData.workVolume,
      directCost: formData.directCost,
      revenue: formData.revenue,
      contractorId: formData.contractorId,
    });
    setFormData({
      title: '',
      type: 'utilities',
      workVolume: 5,
      directCost: 100000000,
      revenue: 150000000,
      contractorId: '',
    });
    onClose();
  };

  // Динамически пересчитываем стоимость и доход с учетом подрядчика
  const baseDirectCost = formData.directCost;
  const baseRevenue = formData.revenue;
  const calculatedDirectCost = formData.contractorId 
    ? calculateTaskCost(baseDirectCost, formData.contractorId)
    : baseDirectCost;
  const calculatedRevenue = formData.contractorId
    ? calculateTaskRevenue(baseRevenue, formData.contractorId)
    : baseRevenue;
  const profit = calculatedRevenue - calculatedDirectCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Добавить задачу</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название задачи *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип работы *
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value;
                const contractors = CONTRACTORS[newType] || [];
                setFormData({ 
                  ...formData, 
                  type: newType,
                  contractorId: contractors[0]?.id || '',
                });
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {Object.values(TASK_TYPES).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Подрядчик *
            </label>
            <select
              value={formData.contractorId}
              onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              {(CONTRACTORS[formData.type] || []).map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.icon} {contractor.name} - {contractor.description}
                </option>
              ))}
            </select>
            {formData.contractorId && (() => {
              const contractor = (CONTRACTORS[formData.type] || []).find(c => c.id === formData.contractorId);
              if (contractor) {
                return (
                  <p className="text-xs text-gray-500 mt-1">
                    Скорость: ×{contractor.speedMultiplier} | Стоимость: {contractor.costMultiplier > 1 ? '+' : ''}{Math.round((contractor.costMultiplier - 1) * 100)}%
                  </p>
                );
              }
              return null;
            })()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Объём работ (2-10 единиц) *
            </label>
            <input
              type="number"
              value={formData.workVolume}
              onChange={(e) => setFormData({ ...formData, workVolume: parseInt(e.target.value) || 5 })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="2"
              max="10"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Каждая задача требует выполнения работы в каждой колонке. Объём работ определяет, сколько единиц работы нужно выполнить в каждой колонке.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Базовая стоимость (₽) *
              </label>
              <input
                type="number"
                value={formData.directCost}
                onChange={(e) => setFormData({ ...formData, directCost: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Базовая: {formatCurrency(formData.directCost)}
              </p>
              <p className="text-xs font-semibold text-red-600 mt-1">
                С подрядчиком: {formatCurrency(calculatedDirectCost)}
                {calculatedDirectCost !== baseDirectCost && (
                  <span className="text-gray-500 ml-1">
                    ({calculatedDirectCost > baseDirectCost ? '+' : ''}{Math.round(((calculatedDirectCost - baseDirectCost) / baseDirectCost) * 100)}%)
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Базовый доход (₽) *
              </label>
              <input
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Базовый: {formatCurrency(formData.revenue)}
              </p>
              <p className="text-xs font-semibold text-green-600 mt-1">
                С подрядчиком: {formatCurrency(calculatedRevenue)}
                {calculatedRevenue !== baseRevenue && (
                  <span className="text-gray-500 ml-1">
                    ({calculatedRevenue > baseRevenue ? '+' : ''}{Math.round(((calculatedRevenue - baseRevenue) / baseRevenue) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {calculatedRevenue > calculatedDirectCost && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800">
                <strong>Прибыль по задаче:</strong> {formatCurrency(profit)}
              </p>
            </div>
          )}

          {calculatedRevenue <= calculatedDirectCost && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                <strong>Внимание:</strong> Доход должен быть больше расходов!
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded transition-colors font-semibold"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: '#EC6428',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#D85A20';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#EC6428';
              }}
            >
              Добавить задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;

