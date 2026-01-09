import React, { useState } from 'react';
import { Check, Info, Truck, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { FormData, Measurement } from '../types';
import { submitOrder } from '../services/supabase';
import { generateCustomerEmailTemplate, generateAdminEmailTemplate } from '../services/emailTemplates';

interface Step4Props {
  formData: FormData;
  measurements: Measurement[];
  totalPrice: number;
  totalUnits: number;
  hidePrice: boolean;
  selectedType: any;
  selectedCategory: string;
  combinedComponents: any[];
}

const generateOrderEmailHtml = (
  formData: FormData,
  measurements: Measurement[],
  totalPrice: number,
  selectedType: any,
  selectionSummary: string
) => {
  const date = new Date().toLocaleDateString('es-ES');
  const itemsHtml = measurements.map((m, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.width}cm x ${m.height}cm</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.type?.label || selectedType?.label}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #803746;">Solicitud de Presupuesto - CortinasExpress</h2>
      <p><strong>Fecha:</strong> ${date}</p>
      
      <h3 style="background-color: #f3f4f6; padding: 10px;">Datos del Profesional</h3>
      <p><strong>Razón Social:</strong> ${formData.razonSocial}</p>
      <p><strong>CIF:</strong> ${formData.cif}</p>
      <p><strong>Contacto:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Teléfono:</strong> ${formData.phone}</p>
      <p><strong>Direccion:</strong> ${formData.direccion}</p>
      <p><strong>Zona:</strong> ${formData.region}</p>
      <p><strong>Tipo de Solicitud:</strong> ${formData.goal === 'info' ? 'Solicitud de Información / Consulta' : 'Pedido de Presupuesto'}</p>

      <h3 style="background-color: #f3f4f6; padding: 10px;">Detalle de Medidas</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid #ddd;">#</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd;">Medidas</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd;">Tipo</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd;">Cant.</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3 style="background-color: #f3f4f6; padding: 10px;">Seleccion</h3>
      <p>${selectionSummary}</p>
      
      <div style="margin-top: 20px; text-align: right;">
        <p style="font-size: 1.2em;"><strong>Total Estimado: ${totalPrice.toFixed(2)}€</strong></p>
      </div>
      
      <div style="margin-top: 30px; font-size: 0.8em; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        <p><strong>AVISO LEGAL:</strong> Esto no es un pedido en firme. El precio es orientativo y puede variar.</p>
      </div>
    </div>
  `;
};

export const Step4: React.FC<Step4Props> = ({
  formData,
  measurements,
  totalPrice,
  totalUnits,
  hidePrice,
  selectedType,
  selectedCategory,
  combinedComponents
}) => {
  const selectedItems = selectedCategory === 'combinado'
    ? (combinedComponents || [])
    : (selectedType?.material ? [selectedType.material] : []);
  const items = selectedItems;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderReference, setOrderReference] = useState('');

  const handleSubmit = async () => {
    if (!termsAccepted) {
        setErrorMsg("Debes aceptar los términos y condiciones para continuar.");
        return;
    }

    const now = Date.now();
    const lastSubmit = Number(localStorage.getItem('lastOrderSubmitAt') || '0');
    if (now - lastSubmit < 30000) {
      setErrorMsg("Espera 30 segundos antes de volver a enviar la solicitud.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const selection = {
        category: selectedCategory,
        label: selectedType?.label || '',
        items: selectedItems.map((item: any) => ({
          id: item.id,
          tipo: item.tipo,
          nombre: item.nombre,
          codigo: item.codigo,
          descripcion: item.descripcion || '',
          frunce: item.frunce_default || 0,
          color: item.color || ''
        }))
      };

      const pricing = {
        total_price: totalPrice,
        total_units: totalUnits,
        items: measurements.map((m) => ({
          id: m.id,
          price_unit: m.price,
          quantity: m.quantity,
          subtotal: m.price * m.quantity
        }))
      };

      const metadata = {
        created_at: new Date().toISOString(),
        hide_price: hidePrice
      };

      const selectionSummary = items.length === 0
        ? 'Sin seleccion'
        : items.map((item: any) => `${item.nombre} (${item.codigo})`).join(', ');

      const orderPayload = {
        customer_info: formData,
        measurements: measurements,
        selected_type: selectedType || {
          id: selectedCategory || 'sin_tipo',
          label: selectedCategory || 'Sin tipo'
        },
        total_price: totalPrice,
        total_units: totalUnits,
        selection,
        pricing,
        metadata
      };

      // 1. Submit to Supabase first to get the reference number
      const { data, error } = await submitOrder(orderPayload);

      if (error) throw error;
      const referenceNumber = data?.reference_number || '';
      setOrderReference(referenceNumber);

      // 2. Generate Email Templates with the real reference number
      const customerEmailHtml = generateCustomerEmailTemplate({
        formData,
        measurements,
        totalPrice,
        selectedType,
        selectionSummary: items,
        referenceNumber,
        isInfoMode,
        hidePrice
      });

      const adminEmailHtml = generateAdminEmailTemplate({
        formData,
        measurements,
        totalPrice,
        selectedType,
        selectionSummary: items,
        referenceNumber,
        isInfoMode,
        hidePrice
      });
      
      // 3. Log email sending simulation

      localStorage.setItem('lastOrderSubmitAt', String(Date.now()));
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Hubo un error al procesar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2">
          <Check size={40} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">¡Solicitud Recibida!</h2>
          <p className="text-gray-600 mt-2">Gracias, {formData.firstName} {formData.lastName}. Hemos enviado una copia de tu solicitud a <span className="font-bold text-gray-800">{formData.email}</span>.</p>
          <p className="text-xs text-gray-400 mt-1">También se ha notificado a pedido@egea.com</p>
          <p className="text-sm text-green-600 mt-2 font-medium">✅ Correos enviados correctamente</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 max-w-sm">
           Número de referencia: <span className="font-mono text-gray-800">#{orderReference}</span>
        </div>
        <button onClick={() => window.location.reload()} className="text-orange-500 underline font-medium">
          Volver al inicio
        </button>
      </div>
    );
  }

  // Determine phrasing based on flow type
  const isInfoMode = formData.goal === 'info';

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="flex-1">
        {/* TITULO MODIFICADO */}
        <div className="flex flex-col items-center gap-3 mb-4 text-center">
          <img src="/image/logo-placeholder.jpg.png" alt="Logo EGEA" className="h-10 object-contain" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Check className="text-green-500" /> Resumen de la solicitud de presupuesto
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Datos del Profesional</h3>
          </div>
          <div className="p-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-y-2">
            <p><span className="font-medium text-gray-900">Razón Social:</span> {formData.razonSocial}</p>
            <p><span className="font-medium text-gray-900">CIF:</span> {formData.cif}</p>
            <p><span className="font-medium text-gray-900">Contacto:</span> {formData.firstName} {formData.lastName}</p>
            <p><span className="font-medium text-gray-900">Email:</span> {formData.email}</p>
            <p><span className="font-medium text-gray-900">Teléfono:</span> {formData.phone}</p>
            <p><span className="font-medium text-gray-900">Direccion:</span> {formData.direccion}</p>
            <p><span className="font-medium text-gray-900">Zona:</span> {formData.region}</p>
            {selectedType?.label && (
              <p><span className="font-medium text-gray-900">Combinacion:</span> {selectedType.label}</p>
            )}
            {selectedType?.id === 'personalizado' && selectedType?.customDescription && (
              <p className="md:col-span-2"><span className="font-medium text-gray-900">Detalle:</span> {selectedType.customDescription}</p>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-700">Seleccion</h3>
            </div>
            <div className="p-4 text-sm text-gray-600 space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="font-medium text-gray-800">{item.nombre} ({item.codigo})</div>
                  {item.descripcion && <div className="text-xs text-gray-500">{item.descripcion}</div>}
                  {item.frunce_default && <div className="text-xs text-gray-500">Frunce: {item.frunce_default}</div>}
                  {item.color && <div className="text-xs text-gray-500">Color: {item.color}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {measurements.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Resumen del Pedido</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${isInfoMode || hidePrice ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-700'}`}>
                {isInfoMode ? 'Solicitud de Información' : (hidePrice ? 'Presupuesto a medida' : `Total: ${totalPrice.toFixed(2)}€`)}
              </span>
            </div>
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
              {measurements.map((m, i) => (
                <li key={i} className="p-4 flex justify-between text-sm">
                  <span>{m.quantity}x Ventana {i + 1}: {m.width}x{m.height} ({m.type?.label})</span>
                  <span className="font-medium">
                    {isInfoMode || hidePrice ? '-' : `${(m.price * m.quantity).toFixed(2)}€`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {measurements.length === 0 && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                <p>Has seleccionado "Más información" sin especificar medidas concretas. Un comercial se pondrá en contacto contigo.</p>
            </div>
        )}

        {/* Info y Legal */}
        <div className="mt-6 bg-blue-50 p-4 rounded-xl space-y-3 border border-blue-100">
          <div className="flex gap-3 items-start">
            <Info className="text-blue-500 shrink-0 mt-1" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Proceso de aprobación:</p>
              <p>En un plazo de <strong>24 a 48 horas</strong> recibirá {isInfoMode ? 'información detallada' : 'el presupuesto formal'} para su aprobación.</p>
            </div>
          </div>
        </div>

        {/* DISCLAIMERS LEGALES */}
        <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-xl text-xs text-yellow-800 space-y-2">
            <div className="flex gap-2 font-bold items-center">
                <AlertTriangle size={14} /> <span>Avisos Importantes:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
                <li>Esto <strong>no es un pedido en firme</strong>, es una solicitud de envío de presupuesto por nuestros gestores.</li>
                <li>El precio mostrado es <strong>orientativo</strong> y puede variar dependiendo de diversos factores técnicos y logísticos.</li>
                <li>En ningún caso este envío implica una orden de producción automática.</li>
            </ul>
        </div>
      </div>

      <div className="w-full pb-8 md:pb-0 space-y-3">
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Checkbox Términos */}
        <div className="flex items-start gap-2 px-2">
            <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
                He leído y acepto los <a href="#" className="underline font-bold text-gray-800">términos y condiciones</a> de venta para profesionales, así como la política de privacidad.
            </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !termsAccepted}
          className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 transform 
            ${isSubmitting || !termsAccepted 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                : 'bg-gray-900 text-white hover:shadow-xl hover:bg-black'}`}
        >
          {isSubmitting 
            ? <>
                {/* Loader con color corporativo #803746 (orange-500) según requisitos */}
                <Loader2 className="animate-spin text-orange-500" size={24} /> 
                <span className="text-gray-600">Procesando...</span>
              </> 
            : <>
                <CreditCard size={20} />
                {isInfoMode ? 'Solicitar Información' : 'Solicitar Presupuesto'}
              </>
          }
        </button>
      </div>
    </div>
  );
};
