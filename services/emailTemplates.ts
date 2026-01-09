import { FormData, Measurement } from '../types';



export interface EmailTemplateData {

  formData: FormData;

  measurements: Measurement[];

  totalPrice: number;

  selectedType: any;

  selectionSummary: any[];

  referenceNumber: string;

  isInfoMode: boolean;

  hidePrice: boolean;

}



export const generateCustomerEmailTemplate = (data: EmailTemplateData): string => {

  const { 

    formData, 

    measurements, 

    totalPrice, 

    selectedType, 

    selectionSummary, 

    referenceNumber,

    isInfoMode = false,

    hidePrice = false

  } = data;



  const currentDate = new Date().toLocaleDateString('es-ES');

  const items = selectionSummary || [];



  return `

    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">

      <!-- Header -->

      <div style="background: linear-gradient(135deg, #803746, #a05252); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">

        <img src="/image/egea-evolucio-g.png" alt="EGEA" style="height: 42px; margin: 0 auto 12px; display: block;" />

        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">EGEA</h1>

        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 14px;">Sistemas de cortinas para profesionales</p>

      </div>



      <!-- Main Content -->

      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

        <div style="text-align: center; margin-bottom: 30px;">

          <h2 style="color: #803746; margin: 0 0 10px 0;">${isInfoMode ? 'Solicitud de Informacion' : 'Presupuesto'} Recibido</h2>

          <p style="color: #6b7280; font-size: 16px; margin: 0;">Gracias por confiar en Decoraciones EGEA S.L. Hemos recibido tu ${isInfoMode ? 'solicitud de informacion' : 'solicitud de presupuesto'} y la estamos procesando.</p>

        </div>



        <!-- Reference Number -->

        <div style="background: #f9fafb; border: 2px solid #803746; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">

          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Numero de referencia de tu ${isInfoMode ? 'solicitud' : 'presupuesto'}:</p>

          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #803746; font-family: monospace;">${referenceNumber}</p>

          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Presupuesto adjunto. Conserva este numero para cualquier consulta.</p>

        </div>



        <!-- Professional Data -->

        <div style="margin-bottom: 25px;">

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Datos del Profesional</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Razon Social:</p>

              <p style="margin: 0; font-weight: 500;">${formData.razonSocial}</p>

            </div>

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">CIF:</p>

              <p style="margin: 0; font-weight: 500;">${formData.cif}</p>

            </div>

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Contacto:</p>

              <p style="margin: 0; font-weight: 500;">${formData.firstName} ${formData.lastName}</p>

            </div>

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Telefono:</p>

              <p style="margin: 0; font-weight: 500;">${formData.phone}</p>

            </div>

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Direccion:</p>

              <p style="margin: 0; font-weight: 500;">${formData.direccion}</p>

            </div>

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Zona:</p>

              <p style="margin: 0; font-weight: 500;">${formData.region}</p>

            </div>

          </div>

          <div style="margin-top: 15px;">

            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Email:</p>

            <p style="margin: 0; font-weight: 500;">${formData.email}</p>

          </div>

        </div>



        <!-- Measurements -->

        ${measurements.length > 0 ? `

        <div style="margin-bottom: 25px;">

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Detalle de Medidas</h3>

          <table style="width: 100%; border-collapse: collapse;">

            <thead>

              <tr style="background: #f9fafb;">

                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">#</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Medidas</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Tipo</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Cant.</th>

              </tr>

            </thead>

            <tbody>

              ${measurements.map((m, i) => `

              <tr>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${i + 1}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.width}cm x ${m.height}cm</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.type?.label || 'Estandar'}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.quantity}</td>

              </tr>

              `).join('')}

            </tbody>

          </table>

        </div>

        ` : ''}



        <!-- Selection -->

        ${items.length > 0 ? `

        <div style="margin-bottom: 25px;">

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Articulos solicitados</h3>

          ${items.map(item => `

          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">

            <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151;">${item.nombre} (${item.codigo})</p>

            ${item.descripcion ? `<p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">${item.descripcion}</p>` : ''}

            ${item.color ? `<p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Color:</strong> ${item.color}</p>` : ''}

          </div>

          `).join('')}

        </div>

        ` : ''}



        <!-- Total -->

        ${!isInfoMode && !hidePrice ? `

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">

          <div style="display: flex; justify-content: space-between; align-items: center;">

            <p style="margin: 0; font-size: 16px; color: #374151;">Total Estimado:</p>

            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #803746;">${totalPrice.toFixed(2)} EUR</p>

          </div>

        </div>

        ` : ''}



        <!-- Next Steps -->

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">

          <h4 style="color: #1e40af; margin: 0 0 10px 0;">Que sigue ahora</h4>

          <ul style="margin: 0; padding-left: 20px; color: #374151;">

            <li style="margin-bottom: 8px;"><strong>Recibiras ${isInfoMode ? 'informacion detallada' : 'tu presupuesto formal'} en un plazo de 24-48 horas habiles</strong></li>

            <li style="margin-bottom: 8px;">Nuestro equipo comercial se pondra en contacto contigo para confirmar detalles tecnicos</li>

            <li style="margin-bottom: 8px;">Podras aprobar o solicitar cambios en tu ${isInfoMode ? 'solicitud' : 'presupuesto'}</li>

            <li>Una vez aprobado, procesaremos tu ${isInfoMode ? 'solicitud' : 'pedido'} con la maxima prioridad</li>

          </ul>

        </div>



        

        <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            Para realizar el ingreso, escribe a <strong>pedidos@decoracionesegea.com</strong> indicando el numero de pedido. Te lo enviaremos nosotros.
          </p>
        </div>

        <!-- Important Notice -->

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px;">

          <p style="margin: 0; color: #92400e; font-size: 14px;">

            <strong>Importante:</strong> ${isInfoMode ? 'Esta es una solicitud de informacion' : 'Este presupuesto es orientativo'}. 

            Los precios pueden variar segun factores tecnicos, logisticos y de disponibilidad de materiales. 

            En ningun caso esto implica un pedido automatico. Nuestro equipo validara todos los detalles contigo antes de proceder.

          </p>

        </div>

      </div>



      <!-- Footer -->

      <div style="background: #374151; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">

        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Tienes dudas o necesitas asesoramiento</p>

        <p style="margin: 0 0 15px 0; color: #d1d5db; font-size: 14px;">Nuestro equipo de atencion al cliente esta aqui para ayudarte:</p>

        <div style="margin-bottom: 15px;">

          <p style="margin: 0 0 5px 0; color: #fbbf24; font-weight: 500;">Email: pedidos@decoracionesegea.com</p>

          <p style="margin: 0; color: #fbbf24; font-weight: 500;">Telefono: +34 60190468</p>

        </div>

        <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 12px;">Horario de atencion: Lunes a Viernes, 9:00-1:00h</p>

        <hr style="border: 1px solid #4b5563; margin: 15px 0;">

        <p style="margin: 0; color: #9ca3af; font-size: 12px;">(c) 2026 DECORACIONES EGEA S.L. - CortinasExpress - Todos los derechos reservados</p>

        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 10px;">Este correo ha sido generado automaticamente. Por favor, no responda a esta direccion.</p>

      </div>

    </div>

  `;

};



export const generateAdminEmailTemplate = (data: EmailTemplateData): string => {

  const { 

    formData, 

    measurements, 

    totalPrice, 

    selectedType, 

    selectionSummary, 

    referenceNumber,

    isInfoMode = false,

    hidePrice = false

  } = data;



  const currentDate = new Date().toLocaleDateString('es-ES');

  const items = selectionSummary || [];



  return `

    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6;">

      <!-- Header -->

      <div style="background: #1f2937; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">

        <img src="/image/egea-evolucio-g.png" alt="EGEA" style="height: 34px; margin: 0 auto 10px; display: block;" />

        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">NUEVA SOLICITUD DE ${isInfoMode ? 'INFORMACION' : 'PRESUPUESTO'}</h1>

        <p style="color: #fbbf24; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">Referencia: ${referenceNumber}</p>

      </div>



      <!-- Main Content -->

      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

        <!-- Professional Data -->

        <div style="margin-bottom: 30px;">

          <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-bottom: 15px;">DATOS DEL PROFESIONAL</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f9fafb; padding: 20px; border-radius: 6px;">

            <div>

              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">RAZON SOCIAL:</p>

              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.razonSocial}</p>

            </div>

            <div>

              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">CIF:</p>

              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.cif}</p>

            </div>

            <div>

              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">CONTACTO:</p>

              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.firstName} ${formData.lastName}</p>

            </div>

            <div>
              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">TELEFONO:</p>
              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.phone}</p>
            </div>
            <div>
              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">DIRECCION:</p>
              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.direccion}</p>
            </div>
            <div>
              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">ZONA:</p>
              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.region}</p>
            </div>

            <div style="grid-column: 1 / -1;">

              <p style="margin: 0 0 3px 0; color: #6b7280; font-size: 12px; font-weight: 600;">EMAIL:</p>

              <p style="margin: 0; font-weight: 500; color: #374151;">${formData.email}</p>

            </div>

          </div>

        </div>



        <!-- Measurements -->

        ${measurements.length > 0 ? `

        <div style="margin-bottom: 30px;">

          <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-bottom: 15px;">DETALLE DE MEDIDAS</h3>

          <table style="width: 100%; border-collapse: collapse; background: white;">

            <thead>

              <tr style="background: #374151; color: white;">

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">#</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">MEDIDAS</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">TIPO</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">CANT.</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">PRECIO UNIT.</th>

                <th style="padding: 12px; text-align: left; border: 1px solid #6b7280; font-weight: 600;">SUBTOTAL</th>

              </tr>

            </thead>

            <tbody>

              ${measurements.map((m, i) => `

              <tr style="background: ${i % 2 === 0 ? '#f9fafb' : 'white'};">

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${i + 1}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.width}cm x ${m.height}cm</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.type?.label || 'Estandar'}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.quantity}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb;">${m.price ? m.price.toFixed(2) + " EUR" : "-"}</td>

                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 500;">${m.price ? (m.price * m.quantity).toFixed(2) + " EUR" : "-"}</td>

              </tr>

              `).join('')}

            </tbody>

          </table>

        </div>

        ` : ''}



        <!-- Selection -->

        ${items.length > 0 ? `

        <div style="margin-bottom: 30px;">

          <h3 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-bottom: 15px;">SELECCION DE MATERIALES</h3>

          ${items.map(item => `

          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #dc2626;">

            <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151; font-size: 16px;">${item.nombre} (${item.codigo})</p>

            ${item.descripcion ? `<p style="margin: 0 0 5px 0; color: #6b7280;">${item.descripcion}</p>` : ''}

            ${item.color ? `<p style="margin: 0 0 5px 0; color: #6b7280;"><strong>Color:</strong> ${item.color}</p>` : ''}

            ${item.frunce_default ? `<p style="margin: 0; color: #6b7280;"><strong>Frunce:</strong> ${item.frunce_default}</p>` : ''}

          </div>

          `).join('')}

        </div>

        ` : ''}



        <!-- Summary -->

        <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin-bottom: 30px;">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">TOTAL DE UNIDADES:</p>

              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #374151;">${measurements.reduce((sum, m) => sum + m.quantity, 0)}</p>

            </div>

            ${!isInfoMode && !hidePrice ? `

            <div>

              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">PRECIO TOTAL ESTIMADO:</p>

              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #dc2626;">${totalPrice.toFixed(2)} EUR</p>

            </div>

            ` : ''}

          </div>

        </div>



        <!-- Action Required -->

        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">

          <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">ACCION REQUERIDA</h4>

          <p style="margin: 0; color: #92400e; font-weight: 500;">

            Procesar esta ${isInfoMode ? 'solicitud de informacion' : 'solicitud de presupuesto'} y contactar al cliente en un plazo maximo de 24-48 horas.

          </p>

        </div>



        <!-- Notes -->

        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px;">

          <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">

            <strong>NOTA IMPORTANTE:</strong> ${isInfoMode ? 'Esta es una solicitud de informacion' : 'El precio mostrado es orientativo'}. 

            Verificar disponibilidad de materiales y condiciones de entrega antes de confirmar.

          </p>

        </div>

      </div>



      <!-- Footer -->

      <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">

        <p style="margin: 0 0 10px 0; font-size: 14px;">Sistema de Gestion de Pedidos - EGEA CortinasExpress</p>

        <p style="margin: 0; color: #9ca3af; font-size: 12px;">Fecha de recepcion: ${currentDate} | Referencia: ${referenceNumber}</p>

      </div>

    </div>

  `;

};
