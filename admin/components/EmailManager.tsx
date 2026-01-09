import React, { useState, useEffect } from 'react';

import { Mail, Eye, Send, RefreshCw, User, Calendar, Phone, Euro, X, CheckCircle, History, Clock, FileText, Plus, Copy, Download } from 'lucide-react';

import { generateCustomerEmailTemplate, generateAdminEmailTemplate } from '../../services/emailTemplates';

import { DatabaseOrder, logEmailSent, getEmailHistory } from '../../services/supabase';



interface EmailTemplate {

  id: string;

  name: string;

  type: 'customer' | 'admin' | 'copy-manager' | 'internal';

  subject: string;

  description: string;

  variables: string[];

  htmlContent: string;

}



interface EmailManagerProps {

  order: DatabaseOrder;

  onClose: () => void;

}



export const EmailManager: React.FC<EmailManagerProps> = ({ order, onClose }) => {

  const [activeTab, setActiveTab] = useState<'customer' | 'admin' | 'history' | 'templates'>('customer');

  const [emailStatus, setEmailStatus] = useState({

    customer: 'not_sent',

    admin: 'not_sent'

  });

  const [emailHistory, setEmailHistory] = useState<any[]>([]);

  const [loadingHistory, setLoadingHistory] = useState(false);

  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);



  // Cargar historial de correos y plantillas

  useEffect(() => {

    const loadEmailHistory = async () => {

      if (activeTab === 'history' && order.id) {

        setLoadingHistory(true);

        try {

          const { data, error } = await getEmailHistory(order.id);

          if (!error && data) {

            setEmailHistory(data);

          }

        } catch (error) {


        } finally {

          setLoadingHistory(false);

        }

      }

    };



    const loadCustomTemplates = () => {


      const savedTemplates = localStorage.getItem('emailTemplates');


      

      if (savedTemplates) {

        try {

          const templates = JSON.parse(savedTemplates);


          setCustomTemplates(templates);

          

          // Seleccionar plantilla por defecto segun el tipo

          const defaultTemplate = templates.find((t: EmailTemplate) => t.type === 'customer');

          if (defaultTemplate) {

            setSelectedTemplate(defaultTemplate);

          }

        } catch (error) {


        }

      } else {


        // Crear plantillas por defecto si no existen

        const defaultTemplates = [

          {

            id: 'presupuesto-cliente',

            name: 'Presupuesto - Cliente',

            type: 'customer',

            subject: 'Presupuesto para tu pedido de cortinas - {{id_pedido}}',

            description: 'Plantilla de presupuesto para clientes',

            variables: ['nombre_cliente', 'id_pedido', 'total_unidades', 'direccion', 'telefono', 'email', 'fecha_presupuesto'],

            htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">

                <h1 style="margin: 0; font-size: 24px;">Presupuesto de Cortinas</h1>

              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">

                <h2>Hola {{nombre_cliente}},</h2>

                <p>Adjunto encontraras el presupuesto detallado para tu pedido de cortinas.</p>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">

                  <h3 style="margin-top: 0;">Resumen del Pedido</h3>

                  <p><strong>ID del Pedido:</strong> {{id_pedido}}</p>

                  <p><strong>Total de Unidades:</strong> {{total_unidades}}</p>

                  <p><strong>Fecha del Presupuesto:</strong> {{fecha_presupuesto}}</p>

                </div>

                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

                <p>Gracias por confiar en nosotros.</p>

              </div>

            </div>`

          },

          {

            id: 'inicio-produccion-cliente',

            name: 'Inicio Produccion - Cliente',

            type: 'customer',

            subject: 'Inicio de produccion - Pedido {{id_pedido}}',

            description: 'Notificacion de inicio de produccion para clientes',

            variables: ['nombre_cliente', 'id_pedido', 'total_unidades', 'fecha_inicio'],

            htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">

                <h1 style="margin: 0; font-size: 24px;">Inicio de Produccion</h1>

              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">

                <h2>Hola {{nombre_cliente}},</h2>

                <p>Nos complace informarte que hemos iniciado la produccion de tus cortinas.</p>

                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">

                  <h3 style="margin-top: 0; color: #166534;">Detalles del Pedido</h3>

                  <p><strong>ID del Pedido:</strong> {{id_pedido}}</p>

                  <p><strong>Total de Unidades:</strong> {{total_unidades}}</p>

                  <p><strong>Fecha de Inicio:</strong> {{fecha_inicio}}</p>

                </div>

                <p>Te mantendremos informado sobre el progreso de tu pedido.</p>

                <p>Gracias por tu paciencia.</p>

              </div>

            </div>`

          }

        ];



        

        setCustomTemplates(defaultTemplates);

        // Guardar en localStorage para futuras veces

        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));

      }

    };



    loadEmailHistory();

    if (activeTab === 'templates') {

      loadCustomTemplates();

    }

  }, [activeTab, order.id]);



  const emailData = {

    formData: order.customer_info,

    measurements: order.measurements || [],

    totalPrice: order.total_price,

    selectedType: order.selected_type,

    selectionSummary: order.selection || [],

    referenceNumber: order.reference_number,

    isInfoMode: order.metadata?.goal === 'info',

    hidePrice: order.metadata?.hide_price || order.metadata?.hidePrice || false

  };



  const customerHtml = generateCustomerEmailTemplate(emailData);

  const adminHtml = generateAdminEmailTemplate(emailData);



  const handleSendEmail = async (type: 'customer' | 'admin') => {

    // Simular envio de email

    setEmailStatus(prev => ({ ...prev, [type]: 'sending' }));

    

    try {

      const recipient = type === 'customer' ? order.customer_info.email : 'pedido@egea.com';

      

      // Simular envio con delay

      await new Promise(resolve => setTimeout(resolve, 1500));

      

      // Registrar el envio en la base de datos

      if (order.id) {

        await logEmailSent(order.id, type, recipient);

      }

      

      setEmailStatus(prev => ({ ...prev, [type]: 'sent' }));


      

      // Recargar historial si estamos en esa pestana

      if (activeTab === 'history') {

        const { data } = await getEmailHistory(order.id!);

        if (data) setEmailHistory(data);

      }

    } catch (error) {


      setEmailStatus(prev => ({ ...prev, [type]: 'not_sent' }));

    }

  };



  const handlePreviewInNewWindow = (html: string, title: string) => {

    const newWindow = window.open('', '_blank', 'width=800,height=600');

    if (newWindow) {

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

    }

  };



  const copyHtmlToClipboard = (html: string) => {

    navigator.clipboard.writeText(html).then(() => {

      alert('HTML copiado al portapapeles');

    });

  };



  const generateCustomEmail = (template: EmailTemplate) => {

    // Obtener estilos guardados

    const savedStyles = localStorage.getItem('emailStyles');

    const styles = savedStyles ? JSON.parse(savedStyles) : {

      primaryColor: '#3b82f6',

      secondaryColor: '#1d4ed8',

      backgroundColor: '#ffffff',

      textColor: '#374151',

      borderColor: '#e5e7eb',

      buttonColor: '#3b82f6',

      buttonTextColor: '#ffffff',

      headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'

    };



    // Datos del pedido para reemplazar variables

    const orderData = {

      nombre_cliente: order.customer_info.name || order.customer_info.empresa || 'Cliente',

      id_pedido: order.reference_number,

      total_unidades: order.measurements.reduce((sum, m) => sum + (m.quantity || 1), 0) || 0,

      direccion: order.customer_info.direccion || 'A confirmar',

      telefono: order.customer_info.telefono || '',

      email: order.customer_info.email || '',

      fecha_presupuesto: new Date().toLocaleDateString('es-ES'),

      fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),

      motivo_urgencia: 'Requiere atencion inmediata'

    };



    let htmlContent = template.htmlContent;

    

    // Reemplazar estilos

    htmlContent = htmlContent.replace(/\{\{primaryColor\}\}/g, styles.primaryColor);

    htmlContent = htmlContent.replace(/\{\{secondaryColor\}\}/g, styles.secondaryColor);

    htmlContent = htmlContent.replace(/\{\{backgroundColor\}\}/g, styles.backgroundColor);

    htmlContent = htmlContent.replace(/\{\{textColor\}\}/g, styles.textColor);

    htmlContent = htmlContent.replace(/\{\{borderColor\}\}/g, styles.borderColor);

    htmlContent = htmlContent.replace(/\{\{buttonColor\}\}/g, styles.buttonColor);

    htmlContent = htmlContent.replace(/\{\{buttonTextColor\}\}/g, styles.buttonTextColor);

    htmlContent = htmlContent.replace(/\{\{headerGradient\}\}/g, styles.headerGradient);

    

    // Reemplazar variables de datos

    Object.keys(orderData).forEach(key => {

      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');

      htmlContent = htmlContent.replace(regex, String(orderData[key as keyof typeof orderData]));

    });



    return htmlContent;

  };



  const handleSendCustomEmail = async (template: EmailTemplate) => {

    setEmailStatus(prev => ({ ...prev, [template.type]: 'sending' }));

    

    try {

      const recipient = template.type === 'customer' ? order.customer_info.email : 'pedido@egea.com';

      const emailContent = generateCustomEmail(template);

      

      // Simular envio con delay

      await new Promise(resolve => setTimeout(resolve, 1500));

      

      // Registrar el envio en la base de datos

      if (order.id) {

        await logEmailSent(order.id, template.type, recipient);

      }

      

      setEmailStatus(prev => ({ ...prev, [template.type]: 'sent' }));


      

      // Recargar historial si estamos en esa pestana

      if (activeTab === 'history') {

        const { data } = await getEmailHistory(order.id!);

        if (data) setEmailHistory(data);

      }

    } catch (error) {


      setEmailStatus(prev => ({ ...prev, [template.type]: 'not_sent' }));

    }

  };



  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] max-h-[90vh] min-h-[640px] overflow-hidden flex flex-col">

        {/* Header */}

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-gray-800">Gestion de Correos</h2>

            <p className="text-sm text-gray-600">Pedido: {order.reference_number}</p>

          </div>

          <button

            onClick={onClose}

            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"

          >

            <X className="w-5 h-5" />

          </button>

        </div>



        {/* Tabs */}

        <div className="flex border-b border-gray-200">

          <button

            onClick={() => setActiveTab('customer')}

            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${

              activeTab === 'customer'

                ? 'border-orange-500 text-orange-600'

                : 'border-transparent text-gray-500 hover:text-gray-700'

            }`}

          >

            <Mail className="w-4 h-4 inline mr-2" />

            Correo Cliente

          </button>

          <button

            onClick={() => setActiveTab('admin')}

            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${

              activeTab === 'admin'

                ? 'border-orange-500 text-orange-600'

                : 'border-transparent text-gray-500 hover:text-gray-700'

            }`}

          >

            <Mail className="w-4 h-4 inline mr-2" />

            Correo Gestor

          </button>

          <button

            onClick={() => setActiveTab('templates')}

            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${

              activeTab === 'templates'

                ? 'border-orange-500 text-orange-600'

                : 'border-transparent text-gray-500 hover:text-gray-700'

            }`}

          >

            <FileText className="w-4 h-4 inline mr-2" />

            Plantillas

          </button>

          <button

            onClick={() => setActiveTab('history')}

            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${

              activeTab === 'history'

                ? 'border-orange-500 text-orange-600'

                : 'border-transparent text-gray-500 hover:text-gray-700'

            }`}

          >

            <History className="w-4 h-4 inline mr-2" />

            Historial

          </button>

        </div>



        {/* Content */}

        <div className="flex-1 overflow-hidden flex">

          {/* Email Preview or History or Templates */}

          <div className="flex-1 overflow-auto p-5 bg-gray-50">

            {activeTab === 'history' ? (

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">

                  <History className="w-5 h-5 mr-2" />

                  Historial de Correos

                </h3>

                

                {loadingHistory ? (

                  <div className="flex items-center justify-center py-8">

                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />

                    <span className="text-gray-600">Cargando historial...</span>

                  </div>

                ) : emailHistory.length === 0 ? (

                  <div className="text-center py-8">

                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />

                    <p className="text-gray-500">No hay correos enviados para este pedido</p>

                    <p className="text-sm text-gray-400 mt-2">

                      Los correos enviados apareceran aqui

                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {emailHistory.map((email) => (

                      <div key={email.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center">

                            {email.email_type === 'customer' ? (

                              <User className="w-4 h-4 text-blue-500 mr-2" />

                            ) : (

                              <Mail className="w-4 h-4 text-green-500 mr-2" />

                            )}

                            <span className="font-medium text-gray-800">

                              {email.email_type === 'customer' ? 'Correo al Cliente' : 'Correo al Gestor'}

                            </span>

                          </div>

                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            email.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {email.status === 'sent' ? 'Enviado' : 'Fallido'}

                          </span>

                        </div>

                        <div className="text-sm text-gray-600 space-y-1">

                          <p><strong>Destinatario:</strong> {email.recipient}</p>

                          <p className="flex items-center">

                            <Clock className="w-3 h-3 mr-1" />

                            {new Date(email.sent_at).toLocaleString('es-ES')}

                          </p>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            ) : activeTab === 'templates' ? (

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                <div className="flex items-center justify-between mb-6">

                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">

                    <FileText className="w-5 h-5 mr-2" />

                    Plantillas de Correo Personalizadas

                  </h3>

                  <div className="flex space-x-2">

                    <button

                      onClick={() => window.open('/admin#email-styles', '_blank')}

                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"

                    >

                      <Plus className="w-4 h-4 mr-1" />

                      Gestionar Plantillas

                    </button>

                  </div>

                </div>



                {customTemplates.length === 0 ? (

                  <div className="text-center py-8">

                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />

                    <p className="text-gray-500 mb-2">No hay plantillas personalizadas disponibles</p>

                    <p className="text-sm text-gray-400 mb-4">

                      Crea plantillas personalizadas en el editor de estilos

                    </p>

                    <button

                      onClick={() => {

                        // Forzar creacion de plantillas por defecto

                                                const defaultTemplates = [

                          {

                            id: 'presupuesto-cliente',

                            name: 'Presupuesto - Cliente',

                            type: 'customer' as const,

                            subject: 'Presupuesto para tu pedido {{id_pedido}}',

                            description: 'Email de presupuesto para clientes',

                            variables: ['nombre_cliente', 'id_pedido', 'total_unidades', 'direccion', 'fecha_presupuesto'],

                            htmlContent: `<!DOCTYPE html>

<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Presupuesto - {{id_pedido}}</title>

</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">

    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">

            <h1 style="color: #3b82f6; margin: 0;">PRESUPUESTO</h1>

        </div>

        <div style="margin-bottom: 30px;">

            <h2 style="color: #3b82f6; margin-bottom: 15px;">Hola {{nombre_cliente}}</h2>

            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6;">

                <p>Adjunto encontraras el presupuesto solicitado para el pedido <strong>{{id_pedido}}</strong>.</p>

            </div>

            <p>Detalles del presupuesto:</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">

                <ul style="list-style: none; padding: 0;">

                    <li style="margin-bottom: 10px; padding: 8px; background-color: white; border-radius: 3px; border-left: 3px solid #3b82f6;">

                        <strong>Total de Unidades:</strong> {{total_unidades}}

                    </li>

                    <li style="margin-bottom: 10px; padding: 8px; background-color: white; border-radius: 3px; border-left: 3px solid #3b82f6;">

                        <strong>Direccion de entrega:</strong> {{direccion}}

                    </li>

                    <li style="margin-bottom: 10px; padding: 8px; background-color: white; border-radius: 3px; border-left: 3px solid #3b82f6;">

                        <strong>Fecha de presupuesto:</strong> {{fecha_presupuesto}}

                    </li>

                </ul>

            </div>

            <p>Quedamos a la espera de tu aprobacion para proceder con el pedido.</p>

            <div style="text-align: center; margin: 20px 0;">

                <a href="#" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">Aprobar Presupuesto</a>

            </div>

            <p>Si tienes alguna pregunta o necesitas ajustar algo, no dudes en contactarnos.</p>

        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666;">

            <p>Saludos cordiales,<br>

            <strong>Equipo Industrial CRM</strong></p>

            <p style="font-size: 12px; margin-top: 10px;">

                Este es un correo automatico, por favor no responda a esta direccion.

            </p>

        </div>

    </div>

</body>

</html>`

                          }

                        ];




                        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));

                        setCustomTemplates(defaultTemplates);

                        alert('Plantillas por defecto creadas. Vuelve a abrir esta ventana para verlas.');

                      }}

                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm mr-2"

                    >

                      Crear Plantillas por Defecto

                    </button>

                    <button

                      onClick={() => window.open('/admin#email-styles', '_blank')}

                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"

                    >

                      Ir al Editor de Plantillas

                    </button>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {customTemplates.map((template) => (

                      <div key={template.id} className="border border-gray-200 rounded-lg p-4">

                        <div className="flex items-start justify-between mb-3">

                          <div>

                            <h4 className="font-medium text-gray-800">{template.name}</h4>

                            <p className="text-sm text-gray-500 mt-1">{template.description}</p>

                          </div>

                          <span className={`text-xs px-2 py-1 rounded ${

                            template.type === 'customer' ? 'bg-blue-100 text-blue-800' :

                            template.type === 'admin' ? 'bg-green-100 text-green-800' :

                            template.type === 'copy-manager' ? 'bg-yellow-100 text-yellow-800' :

                            'bg-gray-100 text-gray-800'

                          }`}>

                            {template.type === 'customer' ? 'Cliente' :

                             template.type === 'admin' ? 'Gestor' :

                             template.type === 'copy-manager' ? 'Copia Gestor' : 'Interno'}

                          </span>

                        </div>

                        

                        <div className="mb-3">

                          <p className="text-sm text-gray-600 mb-2">

                            <strong>Asunto:</strong> {template.subject}

                          </p>

                          <div className="flex flex-wrap gap-1">

                            {template.variables.map((variable) => (

                              <span

                                key={variable}

                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"

                              >

                                {variable}

                              </span>

                            ))}

                          </div>

                        </div>



                        <div className="flex space-x-2">

                          <button

                            onClick={() => handleSendCustomEmail(template)}

                            disabled={emailStatus[template.type] === 'sending'}

                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                              emailStatus[template.type] === 'sent'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : emailStatus[template.type] === 'sending'
                                ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >

                            {emailStatus[template.type] === 'sent' ? (

                              <><CheckCircle className="w-4 h-4 inline mr-1" />Enviado</>

                            ) : emailStatus[template.type] === 'sending' ? (

                              <><RefreshCw className="w-4 h-4 inline mr-1 animate-spin" />Enviando...</>

                            ) : (

                              <><Send className="w-4 h-4 inline mr-1" />Enviar</>

                            )}

                          </button>

                          

                          <button

                            onClick={() => handlePreviewInNewWindow(generateCustomEmail(template), `Vista Previa - ${template.name}`)}

                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors border border-gray-300"

                          >

                            <Eye className="w-4 h-4" />

                          </button>

                          

                          <button

                            onClick={() => copyHtmlToClipboard(generateCustomEmail(template))}

                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors border border-blue-300"

                          >

                            <Copy className="w-4 h-4" />

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            ) : (

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                <iframe

                  srcDoc={activeTab === 'customer' ? customerHtml : adminHtml}

                  className="w-full h-full min-h-[560px] border-0"

                  title="Vista previa del correo"

                />

              </div>

            )}

          </div>



          {/* Sidebar */}

          <div className="w-80 shrink-0 bg-gray-50 border-l border-gray-200 p-5 space-y-5">

            {/* Order Info */}

            <div className="bg-white rounded-lg p-4 border border-gray-200">

              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">

                <User className="w-4 h-4 mr-2" />

                Informacion del Pedido

              </h3>

              <div className="space-y-2 text-sm">

                <div>

                  <span className="text-gray-600">Referencia:</span>

                  <span className="font-mono text-gray-800 ml-2">{order.reference_number}</span>

                </div>

                <div>

                  <span className="text-gray-600">Cliente:</span>

                  <span className="text-gray-800 ml-2">{order.customer_info.razonSocial}</span>

                </div>

                <div>

                  <span className="text-gray-600">Contacto:</span>

                  <span className="text-gray-800 ml-2">

                    {order.customer_info.firstName} {order.customer_info.lastName}

                  </span>

                </div>

                <div>

                  <span className="text-gray-600">Email:</span>

                  <span className="text-gray-800 ml-2">{order.customer_info.email}</span>

                </div>

                <div>

                  <span className="text-gray-600">Total:</span>

                  <span className="text-gray-800 ml-2 font-semibold">

                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total_price)}

                  </span>

                </div>

                <div>

                  <span className="text-gray-600">Fecha:</span>

                  <span className="text-gray-800 ml-2">

                    {new Date(order.created_at || '').toLocaleDateString('es-ES')}

                  </span>

                </div>

              </div>

            </div>



            {/* Email Actions */}

            {activeTab === 'templates' && (

              <div className="bg-white rounded-lg p-4 border border-gray-200">

                <h3 className="font-semibold text-gray-800 mb-3">Plantillas Personalizadas</h3>

                <p className="text-sm text-gray-600 mb-3">

                  Usa las plantillas personalizadas creadas en el editor de estilos.

                </p>

                <button

                  onClick={() => window.open('/admin#email-styles', '_blank')}

                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"

                >

                  <Plus className="w-4 h-4 inline mr-2" />

                  Gestionar Plantillas

                </button>

              </div>

            )}



            {activeTab !== 'history' && activeTab !== 'templates' && (

              <div className="bg-white rounded-lg p-4 border border-gray-200">

                <h3 className="font-semibold text-gray-800 mb-3">

                  {activeTab === 'customer' ? 'Correo al Cliente' : 'Correo al Gestor'}

                </h3>

                

                <div className="space-y-3">

                  <div className="text-sm text-gray-600">

                    {activeTab === 'customer' ? (

                      <p>Destinatario: <span className="font-mono">{order.customer_info.email}</span></p>

                    ) : (

                      <p>Destinatario: <span className="font-mono">pedido@egea.com</span></p>

                    )}

                  </div>



                  {/* Send Button */}

                  <button

                    onClick={() => handleSendEmail(activeTab)}

                    disabled={emailStatus[activeTab] === 'sending'}

                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      emailStatus[activeTab] === 'sent'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : emailStatus[activeTab] === 'sending'
                        ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >

                    {emailStatus[activeTab] === 'sent' ? (

                      <><CheckCircle className="w-4 h-4 inline mr-2" />Enviado</>

                    ) : emailStatus[activeTab] === 'sending' ? (

                      <><RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />Enviando...</>

                    ) : (

                      <><Send className="w-4 h-4 inline mr-2" />Enviar Correo</>

                    )}

                  </button>



                  {/* Preview Button */}

                  <button

                    onClick={() => handlePreviewInNewWindow(

                      activeTab === 'customer' ? customerHtml : adminHtml,

                      activeTab === 'customer' ? 'Vista Previa - Cliente' : 'Vista Previa - Gestor'

                    )}

                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-300"

                  >

                    <Eye className="w-4 h-4 inline mr-2" />

                    Vista Previa

                  </button>



                  {/* Copy HTML Button */}

                  <button

                    onClick={() => copyHtmlToClipboard(activeTab === 'customer' ? customerHtml : adminHtml)}

                    className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors border border-blue-300"

                  >

                    Copiar HTML

                  </button>

                </div>

              </div>

            )}



            {/* Email Content */}

            <div className="bg-white rounded-lg p-4 border border-gray-200">

              <h3 className="font-semibold text-gray-800 mb-3">Contenido del Correo</h3>

              <div className="space-y-2 text-sm">

                <div className="flex items-center text-gray-600">

                  <User className="w-4 h-4 mr-2" />

                  <span>Datos del profesional</span>

                </div>

                <div className="flex items-center text-gray-600">

                  <Calendar className="w-4 h-4 mr-2" />

                  <span>Detalle de medidas</span>

                </div>

                <div className="flex items-center text-gray-600">

                  <Euro className="w-4 h-4 mr-2" />

                  <span>Precios y materiales</span>

                </div>

                <div className="flex items-center text-gray-600">

                  <Phone className="w-4 h-4 mr-2" />

                  <span>Informacion de contacto</span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

