import React, { useState, useEffect } from 'react';
import { Mail, Clock, User, FileText, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { generateCustomerEmailTemplate, generateAdminEmailTemplate } from '../../services/emailTemplates';

interface EmailHistory {
  id: string;
  order_id: string;
  order_reference: string;
  customer_email: string;
  customer_name: string;
  email_type: 'presupuesto_cliente' | 'presupuesto_produccion' | 'confirmacion_direccion' | 'presupuesto_definitivo';
  subject: string;
  sent_at: string;
  status: 'sent' | 'error' | 'pending';
  template_data: any;
  order_data: any;
}

export const EmailHistory: React.FC = () => {
  const [emails, setEmails] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      
      // Obtener los pedidos con información de emails enviados
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, reference_number, customer_info, budget_number, budget_sent_at, status, measurements, selected_type, selection, total_price, metadata')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transformar los datos en formato de historial de emails
      const emailHistory: EmailHistory[] = ordersData
        ?.filter(order => order.budget_sent_at && order.budget_number)
        .map(order => ({
          id: order.id,
          order_id: order.id,
          order_reference: order.reference_number,
          customer_email: order.customer_info?.email || '',
          customer_name: order.customer_info?.razonSocial || 
            `${order.customer_info?.firstName} ${order.customer_info?.lastName}`,
          email_type: 'presupuesto_cliente' as const,
          subject: `Presupuesto Cortinas - ${order.budget_number}`,
          sent_at: order.budget_sent_at,
          status: 'sent' as const,
          template_data: {
            budget_number: order.budget_number,
            customer_info: order.customer_info
          },
          order_data: order
        })) || [];

      setEmails(emailHistory);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'presupuesto_cliente': return 'Presupuesto Cliente';
      case 'presupuesto_produccion': return 'Presupuesto Producción';
      case 'confirmacion_direccion': return 'Confirmación Dirección';
      case 'presupuesto_definitivo': return 'Presupuesto Definitivo';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const filteredEmails = filter === 'all' 
    ? emails 
    : emails.filter(email => email.email_type === filter);

  const buildEmailHtml = (order: any, type: 'customer' | 'admin') => {
    const emailData = {
      formData: order.customer_info,
      measurements: order.measurements || [],
      totalPrice: order.total_price || 0,
      selectedType: order.selected_type,
      selectionSummary: order.selection || [],
      referenceNumber: order.reference_number,
      isInfoMode: order.metadata?.goal === 'info',
      hidePrice: order.metadata?.hide_price || false
    };
    return type === 'customer'
      ? generateCustomerEmailTemplate(emailData)
      : generateAdminEmailTemplate(emailData);
  };

  const handlePreview = (order: any, type: 'customer' | 'admin') => {
    const html = buildEmailHtml(order, type);
    const title = type === 'customer' ? 'Vista Previa - Cliente' : 'Vista Previa - Gestor';
    const newWindow = window.open('', '_blank', 'width=900,height=700');
    if (!newWindow) return;
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
        ${html}
      </body>
      </html>
    `);
    newWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Cargando historial de emails...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-orange-600" />
            Historial de Emails Enviados
          </h3>
          <div className="text-sm text-gray-500">
            {emails.length} emails enviados
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="presupuesto_cliente">Presupuesto Cliente</option>
            <option value="presupuesto_produccion">Presupuesto Producción</option>
            <option value="confirmacion_direccion">Confirmación Dirección</option>
            <option value="presupuesto_definitivo">Presupuesto Definitivo</option>
          </select>
        </div>
      </div>

      {filteredEmails.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No hay emails enviados' : 'No hay emails de este tipo'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Los emails enviados aparecerán aquí una vez que se generen presupuestos.'
              : 'No se encontraron emails del tipo seleccionado.'
            }
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredEmails.map((email) => (
            <div key={email.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {email.status === 'sent' ? 'Enviado' : email.status}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {getEmailTypeLabel(email.email_type)}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {email.subject}
                  </h4>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="w-3 h-3 mr-1" />
                    <span className="mr-4">{email.customer_name}</span>
                    <Mail className="w-3 h-3 mr-1" />
                    <span>{email.customer_email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-3 h-3 mr-1" />
                    <span className="mr-4">Pedido: {email.order_reference}</span>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDate(email.sent_at)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePreview(email.order_data, 'customer')}
                      className="px-3 py-1.5 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Plantilla Cliente
                    </button>
                    <button
                      onClick={() => handlePreview(email.order_data, 'admin')}
                      className="px-3 py-1.5 text-xs rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Plantilla Gestor
                    </button>
                  </div>
                  
                  {email.template_data?.budget_number && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-blue-900">Número de Presupuesto: </span>
                        <span className="text-blue-700 font-mono">{email.template_data.budget_number}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
