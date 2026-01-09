import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Package, Calendar, User, Mail, Phone, Euro, X, FileText, Send } from 'lucide-react';
import { getOrders, updateOrderStatus, DatabaseOrder } from '../../services/supabase';
import { EmailManager } from './EmailManager';
import { supabase } from '../utils/supabaseClient';

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [emailOrder, setEmailOrder] = useState<DatabaseOrder | null>(null);
  const [showEmailManager, setShowEmailManager] = useState(false);
  const [sendingBudget, setSendingBudget] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const { data, error } = await getOrders(filters);
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: DatabaseOrder['status']) => {
    try {
      const { data, error } = await updateOrderStatus(orderId, newStatus);
      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOrders = (format: 'csv' | 'json') => {
    const rows = orders.map((order) => {
      const customer = order.customer_info || {};
      return {
        id: order.id || '',
        reference_number: order.reference_number || '',
        status: order.status || '',
        created_at: order.created_at || '',
        total_price: order.total_price ?? '',
        total_units: order.total_units ?? '',
        budget_number: order.budget_number || '',
        budget_sent_at: (order as any).budget_sent_at || '',
        customer_razon_social: customer.razonSocial || '',
        customer_cif: customer.cif || '',
        customer_first_name: customer.firstName || '',
        customer_last_name: customer.lastName || '',
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_direccion: customer.direccion || '',
        customer_region: customer.region || '',
        measurements_json: JSON.stringify(order.measurements || []),
        selection_json: JSON.stringify(order.selection || []),
        pricing_json: JSON.stringify(order.pricing || {}),
        metadata_json: JSON.stringify(order.metadata || {})
      };
    });

    if (format === 'json') {
      const payload = JSON.stringify(rows, null, 2);
      const filename = `orders-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadFile(filename, payload, 'application/json');
      return;
    }

    const headers = Object.keys(rows[0] || {
      id: '',
      reference_number: '',
      status: '',
      created_at: '',
      total_price: '',
      total_units: '',
      budget_number: '',
      budget_sent_at: '',
      customer_razon_social: '',
      customer_cif: '',
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_direccion: '',
      customer_region: '',
      measurements_json: '',
      selection_json: '',
      pricing_json: '',
      metadata_json: ''
    });

    const escapeCsv = (value: unknown) => {
      const str = value === null || value === undefined ? '' : String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((key) => escapeCsv((row as any)[key])).join(','))
    ];
    const filename = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile(filename, lines.join('\n'), 'text/csv');
  };

  const generateBudgetNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRES-${year}${month}${day}-${random}`;
  };

  const sendBudgetEmail = async (order: DatabaseOrder) => {
    try {
      setSendingBudget(order.id);
      
      const budgetNumber = generateBudgetNumber();
      const currentDate = new Date().toLocaleDateString('es-ES');
      
      // Preparar el template del email
      const emailTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto Cortinas - ${budgetNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7fafc;
        }
        .container {
            background-color: white;
            padding: 36px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            margin-bottom: 28px;
            padding-bottom: 22px;
            border-bottom: 2px solid #803746;
        }
        .header h1 {
            color: #803746;
            margin: 10px 0 0 0;
            font-size: 26px;
            font-weight: 700;
        }
        .header p {
            color: #6b7280;
            margin: 8px 0 0 0;
            font-size: 14px;
        }
        .ref-box {
            background: #f9fafb;
            border: 2px solid #803746;
            border-radius: 10px;
            padding: 18px;
            margin: 24px 0;
            text-align: center;
        }
        .ref-number {
            font-size: 22px;
            font-weight: bold;
            color: #803746;
            font-family: monospace;
        }
        .section {
            margin: 22px 0;
            padding: 16px;
            background-color: #f7fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .section h3 {
            margin: 0 0 12px 0;
            color: #2b6cb0;
            font-size: 16px;
        }
        .delivery-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .delivery-item:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #374151;
        }
        .value {
            color: #2b6cb0;
            font-weight: 600;
        }
        .note {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 14px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 500;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 18px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="/image/Egea- Evolucio G.png" alt="EGEA" style="height: 36px; display: block; margin: 0 auto 6px;" />
            <h1>Presupuesto EGEA</h1>
            <p>Sistemas de cortinas para profesionales</p>
        </div>

        <div class="ref-box">
            <div>Numero de presupuesto</div>
            <div class="ref-number">${budgetNumber}</div>
            <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">Fecha: ${currentDate}</div>
            <div style="margin-top: 6px; font-size: 12px; color: #6b7280;">Presupuesto adjunto.</div>
        </div>

        <div>
            <h2 style="margin: 0 0 8px 0; color: #111827;">Hola ${order.customer_info?.razonSocial || order.customer_info?.firstName + ' ' + order.customer_info?.lastName},</h2>
            <p>Gracias por confiar en Decoraciones EGEA S.L. Hemos recibido tu solicitud y estamos preparando el presupuesto definitivo.</p>
            <p>Confirmaremos la direccion y la ubicacion exacta antes de enviar el documento final para su aprobacion y pago.</p>
        </div>

        <div class="note">
            Importante: este presupuesto es orientativo. Nuestro equipo validara los detalles tecnicos y de entrega contigo antes de confirmar el pedido.
        </div>

        <div class="section">
            <h3>Tiempos de entrega (desde Mallorca)</h3>
            <div class="delivery-item">
                <span class="label">Islas Baleares</span>
                <span class="value">5 dias habiles</span>
            </div>
            <div class="delivery-item">
                <span class="label">Peninsula</span>
                <span class="value">7 dias habiles</span>
            </div>
            <div class="delivery-item">
                <span class="label">Islas Canarias</span>
                <span class="value">10 dias habiles</span>
            </div>
        </div>

        <div class="section" style="border-color: #e5e7eb; background: #f3f4f6;">
            <h3 style="color: #374151;">Pago</h3>
            <div style="color: #374151; font-weight: 500;">Para realizar el ingreso, escribe a <strong>pedidos@decoracionesegea.com</strong> indicando el numero de pedido. Te lo enviaremos nosotros.</div>
        </div>

        <div class="section" style="border-color: #bbf7d0; background: #f0fdf4;">
            <h3 style="color: #166534;">Portes</h3>
            <div style="color: #166534; font-weight: 600;">Portes gratis para todos los destinos.</div>
        </div>

        <p>Si necesitas cambios o tienes dudas, contacta con nuestro equipo.</p>

        <div class="footer">
            <div>DECORACIONES EGEA S.L. - Mallorca</div>
            <div>pedidos@decoracionesegea.com</div>
            <div>Telefono: +34 60190468</div>
            <div>Horario de atencion: Lunes a Viernes, 9:00-1:00h</div>
            <div>(c) 2026 DECORACIONES EGEA S.L. - CortinasExpress - Todos los derechos reservados</div>
            <div>Este correo ha sido generado automaticamente. Por favor, no respondas a esta direccion.</div>
        </div>
    </div>
</body>
</html>`;
      
      // Enviar el email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: order.customer_info?.email,
          subject: `Presupuesto Cortinas - ${budgetNumber}`,
          html: emailTemplate,
          template: 'presupuesto_cliente',
          data: {
            numero_presupuesto: budgetNumber,
            nombre_cliente: order.customer_info?.razonSocial || order.customer_info?.firstName + ' ' + order.customer_info?.lastName,
            fecha_actual: currentDate
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar el email');
      }
      
      // Actualizar el pedido con el número de presupuesto
      await supabase
        .from('orders')
        .update({ 
          budget_number: budgetNumber,
          budget_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      alert(`Presupuesto ${budgetNumber} enviado correctamente al cliente.`);
      
    } catch (error) {
      alert('Error al enviar el presupuesto. Por favor, inténtelo de nuevo.');
    } finally {
      setSendingBudget(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Gestión de Pedidos</h2>
          <p className="text-sm text-gray-500">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por cliente, email o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
            <option value="completed">Completados</option>
          </select>

          <button
            type="button"
            onClick={() => exportOrders('csv')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => exportOrders('json')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Exportar JSON
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron pedidos con los filtros aplicados.'
              : 'Aún no hay pedidos registrados en el sistema.'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.reference_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customer_info?.razonSocial}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_info?.firstName} {order.customer_info?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.created_at || '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.total_units}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-orange-600 hover:text-orange-900 p-1"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEmailOrder(order);
                          setShowEmailManager(true);
                        }}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Correo gestor"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id!, 'approved')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Aprobar pedido"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id!, 'rejected')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Rechazar pedido"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {order.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(order.id!, 'completed')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Marcar como completado"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Pedido {selectedOrder.reference_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedOrder.created_at || '')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Información del cliente */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Información del Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Razón Social</p>
                    <p className="font-medium">{selectedOrder.customer_info?.razonSocial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CIF</p>
                    <p className="font-medium">{selectedOrder.customer_info?.cif}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contacto</p>
                    <p className="font-medium">
                      {selectedOrder.customer_info?.firstName} {selectedOrder.customer_info?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {selectedOrder.customer_info?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                  <div>
                    <p className="text-sm text-gray-600">Direccion</p>
                    <p className="font-medium">{selectedOrder.customer_info?.direccion || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zona</p>
                    <p className="font-medium">{selectedOrder.customer_info?.region || '-'}</p>
                  </div>
                    <p className="font-medium flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {selectedOrder.customer_info?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medidas y selección */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Detalles del Pedido
                </h4>
                
                {selectedOrder.measurements && selectedOrder.measurements.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Medidas:</h5>
                    {selectedOrder.measurements.map((measurement: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <span className="text-sm">
                          {measurement.quantity}x {measurement.width}cm × {measurement.height}cm
                          {measurement.type?.label && ` (${measurement.type.label})`}
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(measurement.price * measurement.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrder.selected_type && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Tipo seleccionado:</h5>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{selectedOrder.selected_type.label}</p>
                      {selectedOrder.selected_type.description && (
                        <p className="text-sm text-gray-600">{selectedOrder.selected_type.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de precios */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <Euro className="w-4 h-4 mr-2" />
                  Resumen Económico
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total de unidades:</span>
                    <span className="font-medium">{selectedOrder.total_units}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total del pedido:</span>
                    <span className="text-orange-600">{formatCurrency(selectedOrder.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setEmailOrder(selectedOrder);
                    setShowEmailManager(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Gestionar Correos
                </button>
                
                <button
                  onClick={() => sendBudgetEmail(selectedOrder)}
                  disabled={sendingBudget === selectedOrder.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {sendingBudget === selectedOrder.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Presupuesto
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedOrder.id!, 'rejected');
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedOrder.id!, 'approved');
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                  </>
                )}
                
                {selectedOrder.status === 'approved' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id!, 'completed');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Marcar como Completado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Manager Modal */}
      {showEmailManager && emailOrder && (
        <EmailManager
          order={emailOrder}
          onClose={() => {
            setShowEmailManager(false);
            setEmailOrder(null);
          }}
        />
      )}
    </div>
  );
};
