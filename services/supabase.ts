import { createClient } from '@supabase/supabase-js';
import { OrderData } from '../types';
import type { Material } from '../types';

// NOTE: In a real project, use import.meta.env.VITE_SUPABASE_URL
// For this demo, we check if they exist, otherwise we mock the client to prevent runtime crashes if keys are missing.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DatabaseOrder {
  id?: string;
  customer_info: any;
  measurements: any[];
  selected_type: any;
  total_price: number;
  total_units: number;
  selection: any;
  pricing: any;
  metadata: any;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference_number: string;
  budget_number?: string;
  created_at?: string;
  updated_at?: string;
}

const ensureAdminSession = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const submitOrder = async (orderData: OrderData) => {
  // If keys are missing, throw a helpful error
  if (supabaseUrl === 'https://placeholder-url.supabase.co') {
     await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
     return { data: { id: 'simulated-id', reference_number: 'EG000000' }, error: null };
  }

  try {
    // Generar número de referencia único
    const referenceNumber = `EG${Date.now().toString().slice(-8)}`;
    
    const orderPayload = {
      ...orderData,
      status: 'pending',
      reference_number: referenceNumber
    };

    const { error } = await supabase
      .from('orders')
      .insert([orderPayload]);

    if (error) throw error;
    
    // Añadir el número de referencia al objeto de respuesta
    return { data: { reference_number: referenceNumber }, error: null };
  } catch (error) {
        return { data: null, error };
  }
};

export const getOrders = async (filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) => {
  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { data: [], error: null } as any;
    }

    if (supabaseUrl === 'https://placeholder-url.supabase.co') {
      return { 
        data: [
          {
            id: '1',
            reference_number: 'EG000001',
            customer_info: {
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'juan@example.com',
              phone: '666777888',
              razonSocial: 'Decoraciones SL',
              cif: 'B12345678',
              direccion: 'Calle Mayor 12, Palma',
              region: 'Illes Balears'
            },
            total_price: 1250.50,
            total_units: 15,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ] as DatabaseOrder[], 
        error: null 
      };
    }

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters?.search) {
      query = query.or(`customer_info->>firstName.ilike.%${filters.search}%,customer_info->>lastName.ilike.%${filters.search}%,customer_info->>email.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Añadir números de referencia a los pedidos que no los tengan
    const ordersWithReferences = data?.map((order, index) => ({
      ...order,
      reference_number: order.reference_number || `EG${String((order.created_at ? new Date(order.created_at).getTime() : Date.now()) + index).slice(-8)}`
    })) || [];
    
    return { data: ordersWithReferences as DatabaseOrder[], error: null };
  } catch (error) {
        return { data: [], error };
  }
};

export const getOrderById = async (id: string) => {
  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { data: null, error: null } as any;
    }

    if (supabaseUrl === 'https://placeholder-url.supabase.co') {
      return { 
        data: {
          id: '1',
          reference_number: 'EG000001',
          customer_info: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
            phone: '666777888',
            razonSocial: 'Decoraciones SL',
            cif: 'B12345678'
          },
          measurements: [
            { width: 150, height: 200, quantity: 5, price: 50 }
          ],
          total_price: 1250.50,
          total_units: 15,
          status: 'pending',
          created_at: new Date().toISOString()
        } as DatabaseOrder, 
        error: null 
      };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Añadir número de referencia si no existe
    const orderWithReference = {
      ...data,
      reference_number: data?.reference_number || `EG${String(data?.created_at ? new Date(data.created_at).getTime() : Date.now()).slice(-8)}`
    };
    
    return { data: orderWithReference as DatabaseOrder, error: null };
  } catch (error) {
        return { data: null, error };
  }
};

export const updateOrderStatus = async (id: string, status: DatabaseOrder['status']) => {
  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { data: null, error: null } as any;
    }

    if (supabaseUrl === 'https://placeholder-url.supabase.co') {
      return { 
        data: { 
          id, 
          status
        } as DatabaseOrder, 
        error: null 
      };
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as DatabaseOrder, error: null };
  } catch (error) {
        return { data: null, error };
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { error: null } as any;
    }

    if (supabaseUrl === 'https://placeholder-url.supabase.co') {
      return { error: null };
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
        return { error };
  }
};

export const getMaterials = async () => {
  if (supabaseUrl === 'https://placeholder-url.supabase.co') {
    return [] as Material[];
  }

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Material[];
};

// Función para registrar envío de correos (simulado)
export const logEmailSent = async (orderId: string, emailType: 'customer' | 'admin', recipient: string) => {
  if (supabaseUrl === 'https://placeholder-url.supabase.co') {
        return { data: { id: 'log-' + Date.now() }, error: null };
  }

  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { data: null, error: null } as any;
    }

    const { data, error } = await supabase
      .from('email_logs')
      .insert([{
        order_id: orderId,
        email_type: emailType,
        recipient: recipient,
        sent_at: new Date().toISOString(),
        status: 'sent'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
        return { data: null, error };
  }
};

// Función para obtener el historial de correos de un pedido
export const getEmailHistory = async (orderId: string) => {
  if (supabaseUrl === 'https://placeholder-url.supabase.co') {
    return {
      data: [
        {
          id: 'log-1',
          order_id: orderId,
          email_type: 'customer',
          recipient: 'cliente@example.com',
          sent_at: new Date().toISOString(),
          status: 'sent'
        },
        {
          id: 'log-2',
          order_id: orderId,
          email_type: 'admin',
          recipient: 'pedido@egea.com',
          sent_at: new Date().toISOString(),
          status: 'sent'
        }
      ],
      error: null
    };
  }

  try {
    const hasSession = await ensureAdminSession();
    if (!hasSession) {
      return { data: [], error: null } as any;
    }

    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
        return { data: [], error };
  }
};
