import React from 'react';
import { IEvent, EVENTS } from '../types';

interface EventsPanelProps {
  events: IEvent[];
}

const EventsPanel = ({ events }: EventsPanelProps) => {
  const recentEvents = events.slice(-5).reverse(); // Последние 5 событий
  
  if (recentEvents.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ borderLeft: '4px solid #F59E0B' }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#1B1918', fontFamily: 'Montserrat, sans-serif' }}>
        📰 События
      </h2>
      <div className="space-y-2">
        {recentEvents.map(event => {
          const eventInfo = EVENTS[event.type];
          const isPositive = event.type === 'equipment_bonus';
          const isNegative = event.type === 'heavy_rain' || event.type === 'design_error' || event.type === 'safety_violation';
          
          return (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-l-4 ${
                isPositive ? 'bg-green-50 border-green-500' :
                isNegative ? 'bg-red-50 border-red-500' :
                'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {eventInfo.name} (День {event.day})
                  </div>
                  <div className="text-xs text-gray-600">{event.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPanel;

