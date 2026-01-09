import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, ShoppingCart, Mail, TrendingUp, Calendar, MapPin, DollarSign, Package, Eye, MousePointer, Clock, CheckCircle, XCircle, AlertTriangle, Target, Truck, MessageSquare, Phone, Home, Settings, FileText, Download, Filter } from 'lucide-react';
import { DeliveryMap } from './DeliveryMap';
import { EmailHistory } from './EmailHistory';

interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  topMaterials: Array<{ name: string; count: number; revenue: number }>;
  recentOrders: Array<any>;
  monthlyTrends: Array<{ month: string; orders: number; revenue: number }>;
  customerSources: Array<{ source: string; count: number; percentage: number }>;
  geographicData: Array<{ region: string; orders: number; customers: number }>;
  emailStats: {
    sent: number;
    opened: number;
    clicked: number;
    conversion: number;
  };
  // Métricas específicas de Meta Ads
  metaAdsMetrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    spend: number;
    roas: number;
    conversions: number;
    conversionRate: number;
  };
  // Métricas de ventas y envío
  shippingMetrics: {
    pending: number;
    inProduction: number;
    shipped: number;
    delivered: number;
    averageDeliveryTime: number;
  };
  // Análisis de clientes
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
    lifetimeValue: number;
    averageOrderFrequency: number;
  };
  // Análisis de productos
  productMetrics: {
    topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
    lowStockProducts: Array<{ name: string; stock: number }>;
    profitMarginByProduct: Array<{ name: string; margin: number }>;
  };
}

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    topMaterials: [],
    recentOrders: [],
    monthlyTrends: [],
    customerSources: [],
    geographicData: [],
    emailStats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      conversion: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de clientes
      const { data: customersData, error: customersError } = await supabase
        .from('orders')
        .select('customer_info');

      // Obtener pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (customersError || ordersError) {
        // En caso de error, usar datos vacíos
        setStats({
          totalCustomers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          avgOrderValue: 0,
          conversionRate: 0,
          topMaterials: [],
          recentOrders: [],
          monthlyTrends: [],
          customerSources: [],
          geographicData: [],
          emailStats: {
            sent: 0,
            opened: 0,
            clicked: 0,
            conversion: 0
          },
          metaAdsMetrics: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0,
            spend: 0,
            roas: 0,
            conversions: 0,
            conversionRate: 0
          },
          shippingMetrics: {
            pending: 0,
            inProduction: 0,
            shipped: 0,
            delivered: 0,
            averageDeliveryTime: 0
          },
          customerMetrics: {
            newCustomers: 0,
            returningCustomers: 0,
            churnRate: 0,
            lifetimeValue: 0,
            averageOrderFrequency: 0
          },
          productMetrics: {
            topSellingProducts: [],
            lowStockProducts: [],
            profitMarginByProduct: []
          }
        });
        return;
      }

      // Procesar datos reales
      const processedStats = processData(customersData || [], ordersData || []);
      setStats(processedStats);
      setOrders(ordersData || []);
      
    } catch (error) {
      // En caso de error, usar datos vacíos
      setStats({
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        topMaterials: [],
        recentOrders: [],
        monthlyTrends: [],
        customerSources: [],
        geographicData: [],
        emailStats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          conversion: 0
        },
        metaAdsMetrics: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          cpc: 0,
          spend: 0,
          roas: 0,
          conversions: 0,
          conversionRate: 0
        },
        shippingMetrics: {
          pending: 0,
          inProduction: 0,
          shipped: 0,
          delivered: 0,
          averageDeliveryTime: 0
        },
        customerMetrics: {
          newCustomers: 0,
          returningCustomers: 0,
          churnRate: 0,
          lifetimeValue: 0,
          averageOrderFrequency: 0
        },
        productMetrics: {
          topSellingProducts: [],
          lowStockProducts: [],
          profitMarginByProduct: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const processData = (customers: any[], orders: any[]): DashboardStats => {
    // Procesar clientes únicos
    const uniqueCustomers = new Set(customers.map(order => order.customer_info?.email)).size;
    
    // Procesar pedidos
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Estadísticas de email - solo datos reales disponibles
    const emailStats = {
      sent: 0,
      opened: 0,
      clicked: 0,
      conversion: 0
    };

    // Análisis de materiales más populares
    const materialCounts: { [key: string]: { count: number; revenue: number } } = {};
    orders.forEach(order => {
      const material = order.selected_type?.label || 'Desconocido';
      if (!materialCounts[material]) {
        materialCounts[material] = { count: 0, revenue: 0 };
      }
      materialCounts[material].count++;
      materialCounts[material].revenue += order.total_price || 0;
    });

    const topMaterials = Object.entries(materialCounts)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Análisis geográfico
    const regionData: { [key: string]: { orders: number; customers: Set<string> } } = {};
    orders.forEach(order => {
      const region = order.customer_info?.region || order.customer_info?.direccion?.split(',')[0] || 'Sin zona';
      if (!regionData[region]) {
        regionData[region] = { orders: 0, customers: new Set() };
      }
      regionData[region].orders++;
      regionData[region].customers.add(order.customer_info?.email);
    });

    const geographicData = Object.entries(regionData)
      .map(([region, data]) => ({
        region,
        orders: data.orders,
        customers: data.customers.size
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Métricas de Meta Ads - solo datos reales (0 si no hay datos)
    const metaAdsMetrics = {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      spend: 0,
      roas: 0,
      conversions: 0,
      conversionRate: 0
    };

    // Métricas de envío basadas en datos reales
    const shippingMetrics = {
      pending: pendingOrders,
      inProduction: 0,
      shipped: 0,
      delivered: completedOrders,
      averageDeliveryTime: 0
    };

    // Análisis de clientes basado en datos reales
    const customerEmails = orders.map(order => order.customer_info?.email);
    const uniqueCustomerEmails = new Set(customerEmails);
    const newCustomers = uniqueCustomerEmails.size;
    
    const customerMetrics = {
      newCustomers,
      returningCustomers: 0,
      churnRate: 0,
      lifetimeValue: avgOrderValue,
      averageOrderFrequency: 0
    };

    // Análisis de productos basado en materiales reales
    const topSellingProducts = topMaterials.map(material => ({
      name: material.name,
      quantity: material.count,
      revenue: material.revenue
    }));

    const productMetrics = {
      topSellingProducts,
      lowStockProducts: [],
      profitMarginByProduct: []
    };

    return {
      totalCustomers: uniqueCustomers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue,
      conversionRate: 0,
      topMaterials,
      recentOrders: orders.slice(-10).reverse(),
      monthlyTrends: [],
      customerSources: [],
      geographicData,
      emailStats,
      metaAdsMetrics,
      shippingMetrics,
      customerMetrics,
      productMetrics
    };
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: any) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };

    return (
      <div className={`p-4 rounded-lg border ${colors[color]} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
          <Icon className="w-8 h-8 opacity-75" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Campañas</h1>
          <p className="text-gray-600">Análisis completo de ventas, clientes y rendimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Clientes Totales" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend={0} 
          color="blue" 
        />
        <StatCard 
          title="Pedidos Totales" 
          value={stats.totalOrders} 
          icon={ShoppingCart} 
          trend={0} 
          color="green" 
        />
        <StatCard 
          title="Ingresos Totales" 
          value={`€${stats.totalRevenue.toLocaleString('es-ES')}`} 
          icon={DollarSign} 
          trend={0} 
          color="purple" 
        />
        <StatCard 
          title="Tasa de Conversión" 
          value={`${stats.conversionRate.toFixed(1)}%`} 
          icon={TrendingUp} 
          trend={0} 
          color="orange" 
        />
      </div>

      {/* Estadísticas de Estado de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Completados</p>
              <p className="text-2xl font-bold text-green-900">{stats.completedOrders}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Cancelados</p>
              <p className="text-2xl font-bold text-red-900">{stats.cancelledOrders}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Análisis de Materiales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-orange-500" />
          Materiales Más Populares
        </h3>
        <div className="space-y-3">
          {stats.topMaterials.map((material, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{material.name}</p>
                  <p className="text-sm text-gray-600">{material.count} pedidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">€{material.revenue.toLocaleString('es-ES')}</p>
                <p className="text-sm text-gray-600">Ingresos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución Geográfica con Mapa */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
          Distribución Geográfica - Tiempos de Entrega
        </h3>
        
        {/* Mapa de distribución */}
        <DeliveryMap orders={orders} />
        
        {/* Resumen estadístico */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.geographicData.map((region, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{region.region}</h4>
                <span className="text-sm text-gray-600">#{index + 1}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pedidos:</span>
                  <span className="font-medium">{region.orders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clientes:</span>
                  <span className="font-medium">{region.customers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            <strong>Nota:</strong> Todos los envíos salen desde Mallorca con portes gratuitos. 
            Los tiempos de entrega son días hábiles desde la confirmación del pago.
          </p>
        </div>
      </div>

      {/* Estadísticas de Email Marketing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-orange-500" />
          Email Marketing Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats.emailStats.sent}</p>
            <p className="text-sm text-blue-700">Emails Enviados</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{stats.emailStats.opened}</p>
            <p className="text-sm text-green-700">Abiertos</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <MousePointer className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{stats.emailStats.clicked}</p>
            <p className="text-sm text-yellow-700">Clics</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{stats.emailStats.conversion}</p>
            <p className="text-sm text-purple-700">Conversiones</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {stats.emailStats.sent > 0 ? ((stats.emailStats.opened / stats.emailStats.sent) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Tasa Apertura</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {stats.emailStats.opened > 0 ? ((stats.emailStats.clicked / stats.emailStats.opened) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Tasa Click</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {stats.emailStats.clicked > 0 ? ((stats.emailStats.conversion / stats.emailStats.clicked) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Tasa Conversión</p>
          </div>
        </div>
      </div>

      {/* Sistema de Presupuestos y Envíos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Sistema de Presupuestos y Envíos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Presupuestos Activos</div>
            <div className="text-2xl font-bold text-gray-900">{stats.recentOrders.filter(o => o.status === 'pending').length}</div>
            <div className="text-xs text-blue-600">Pendientes de envío</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">Envíos Confirmados</div>
            <div className="text-2xl font-bold text-gray-900">{stats.shippingMetrics.shipped}</div>
            <div className="text-xs text-green-600">En tránsito</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="text-sm text-gray-600 mb-1">Tiempos de Entrega</div>
            <div className="text-lg font-bold text-gray-900">5-10 días</div>
            <div className="text-xs text-orange-600">Según destino</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Proceso de Presupuesto y Envío</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• <strong>Presupuesto autogenerado:</strong> Se envía automáticamente al cliente con número único</p>
            <p>• <strong>Verificación:</strong> Contactamos para confirmar dirección y ubicación exacta</p>
            <p>• <strong>Confirmación final:</strong> Enviamos presupuesto definitivo para pago</p>
            <p>• <strong>Tiempos de entrega:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Islas Baleares: 5 días hábiles (desde Mallorca)</li>
              <li>• Península: 7 días hábiles</li>
              <li>• Canarias: 10 días hábiles</li>
            </ul>
            <p className="font-medium text-green-700">✓ Portes gratuitos para todos los destinos</p>
          </div>
        </div>
      </div>

      {/* Control de Ventas y Envío */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Envíos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Control de Envíos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-red-600" />
                <span className="font-medium">Pendientes</span>
              </div>
              <span className="font-bold text-red-600">{stats.shippingMetrics.pending}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="font-medium">En Producción</span>
              </div>
              <span className="font-bold text-yellow-600">{stats.shippingMetrics.inProduction}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">Enviados</span>
              </div>
              <span className="font-bold text-blue-600">{stats.shippingMetrics.shipped}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">Entregados</span>
              </div>
              <span className="font-bold text-green-600">{stats.shippingMetrics.delivered}</span>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Tiempo promedio de entrega</div>
              <div className="text-lg font-bold text-gray-900">{stats.shippingMetrics.averageDeliveryTime} días</div>
            </div>
          </div>
        </div>

        {/* Análisis de Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Análisis de Clientes
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Clientes Nuevos</span>
              <span className="font-bold text-blue-600">{stats.customerMetrics.newCustomers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Clientes Recurrentes</span>
              <span className="font-bold text-green-600">{stats.customerMetrics.returningCustomers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium">Tasa de Abandono</span>
              <span className="font-bold text-yellow-600">{stats.customerMetrics.churnRate}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium">Valor de Vida</span>
              <span className="font-bold text-purple-600">€{stats.customerMetrics.lifetimeValue}</span>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Frecuencia promedio de compra</div>
              <div className="text-lg font-bold text-gray-900">{stats.customerMetrics.averageOrderFrequency} pedidos/año</div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-orange-500" />
          Análisis de Productos
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos Más Vendidos */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Productos Más Vendidos</h4>
            <div className="space-y-2">
              {stats.productMetrics.topSellingProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.quantity} unidades</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">€{product.revenue.toLocaleString('es-ES')}</div>
                    {stats.productMetrics.profitMarginByProduct.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {stats.productMetrics.profitMarginByProduct.find(p => p.name === product.name.split(' ')[0] + ' ' + product.name.split(' ')[1])?.margin || 35}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos con Bajo Stock */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Productos con Bajo Stock</h4>
            <div className="space-y-2">
              {stats.productMetrics.lowStockProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">Stock: {product.stock} unidades</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600 font-medium">¡URGENTE!</div>
                    <div className="text-xs text-gray-500">Reabastecer</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos Recientes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-500" />
          Pedidos Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Referencia</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{order.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_info?.razonSocial}</p>
                      <p className="text-xs text-gray-600">{order.customer_info?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    €{(order.total_price || 0).toLocaleString('es-ES')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'completed' ? 'Completado' :
                       order.status === 'pending' ? 'Pendiente' :
                       order.status === 'cancelled' ? 'Cancelado' : 'Desconocido'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.created_at || order.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Emails Enviados */}
      <EmailHistory />

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">¿Listo para optimizar tus campañas?</h3>
            <p className="opacity-90">
              Analiza estos datos para mejorar tu estrategia de marketing y aumentar las conversiones.
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Exportar Datos
            </button>
            <button className="px-4 py-2 bg-orange-700 text-white rounded-lg font-medium hover:bg-orange-800 transition-colors">
              Ver Informe Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
