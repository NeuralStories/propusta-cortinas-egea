import React from 'react';

interface DeliveryZone {
  name: string;
  days: number;
  description: string;
}

export const DeliveryMapSimplified: React.FC = () => {
  const zones: DeliveryZone[] = [
    {
      name: 'Islas Baleares',
      days: 5,
      description: 'Entrega rápida dentro de las islas'
    },
    {
      name: 'Península',
      days: 7,
      description: 'Entrega estándar a la península'
    },
    {
      name: 'Canarias',
      days: 10,
      description: 'Entrega a las islas Canarias'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Distribución Geográfica - Tiempos de Entrega
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Origen de Envíos</h4>
          <p className="text-sm text-gray-600">Todos los envíos salen desde nuestra base en Mallorca.</p>
          <p className="text-sm text-gray-600 mt-1">Portes gratuitos para todos los destinos.</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Tiempos de Entrega por Zona</h4>
          <div className="space-y-3">
            {zones.map((zone, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{zone.name}</p>
                  <p className="text-sm text-gray-600">{zone.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">{zone.days}</p>
                  <p className="text-xs text-gray-500">días hábiles</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Los tiempos de entrega son desde la confirmación del pago</li>
            <li>• Todos los envíos incluyen seguro y tracking</li>
            <li>• Contactaremos para confirmar dirección exacta antes del envío</li>
            <li>• Los plazos pueden variar según disponibilidad de materiales</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMapSimplified;