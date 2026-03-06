import { StatCard } from "@/components/admin/StatCard";
import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { fetchDashboardDetails, fetchInvoices, fetchTables } from "@/api/index.js";
import { getCurrentUser } from "../../auth/auth";
import { toast } from "sonner";
import { useDashboardSSE } from "@/hooks/useDashboardSSE";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  UtensilsCrossed,
  Coffee,
  MapPin,
  Loader2,
  ExternalLink,
  Layers,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line,
  ComposedChart
} from "recharts";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COLORS = ['hsl(32, 95%, 44%)', 'hsl(15, 70%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(199, 89%, 48%)'];
const PAYMENT_COLORS = ['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(32, 95%, 44%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)'];

export default function AdminDashboard() {
  const user = getCurrentUser();
  const branchLabel =
    user?.branch_name || (user?.branch_id ? `Branch #${user.branch_id}` : "Global");

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState<any[]>([]);
  const [sseConnected, setSSEConnected] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // SSE: Real-time dashboard updates
  const handleSSEUpdate = useCallback((data: any) => {
    if (data.success) {
      setDashboardData((prev: any) => ({
        ...prev,
        ...data,
      }));
      setSSEConnected(true);

      // If we have recent_orders/recent_activity in the SSE data, use them
      if (data.recent_orders || data.recent_activity) {
        const raw = data.recent_orders || data.recent_activity;
        const sorted = [...raw].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentOrders(sorted.slice(0, 5));
      } else {
        // Fallback: refresh recent orders manually
        loadRecentOrders();
      }
    }
  }, []);

  useDashboardSSE(user?.branch_id, handleSSEUpdate);

  useEffect(() => {
    loadDashboardData();
    loadRecentOrders();
    loadTableData();
  }, [user?.branch_id]);

  const loadDashboardData = async () => {
    try {
      // api.md spec:
      // - ADMIN/SUPER_ADMIN with no branch_id → global summary (total_sales, total_branch, etc.)
      // - ADMIN/SUPER_ADMIN with branch_id  → branch-specific today's stats
      // - BRANCH_MANAGER                     → branch-specific today's stats (no id in URL)
      const isSuperOrAdmin = user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      const branchId = isSuperOrAdmin ? (user?.branch_id || null) : null;
      const data = await fetchDashboardDetails(branchId);
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard details:", error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  const loadTableData = async () => {
    try {
      const tablesData = await fetchTables();
      const branchId = user?.branch_id;
      const branchFloors =
        branchId != null
          ? (tablesData || []).filter((f: any) => f.branch === branchId)
          : tablesData || [];
      setFloors(branchFloors);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  };

  const loadRecentOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      // Sort by ID descending (newest first)
      const sorted = Array.isArray(data)
        ? [...data].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [];

      // For branch-scoped admin/super admin, only show orders from that branch
      const isSuperOrAdmin =
        user?.is_superuser || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
      const hasBranchScope = isSuperOrAdmin && user?.branch_id;

      const filtered = hasBranchScope
        ? sorted.filter(
          (order: any) =>
            order.branch === user.branch_id || order.branch_id === user.branch_id
        )
        : sorted;

      // Show only top 5 recent
      setRecentOrders(filtered.slice(0, 5));
    } catch (err: any) {
      // Slient fail for dashboard recent orders if it's not the primary focus
      console.error("Dashboard recent orders failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine if we're showing global summary (admin/superadmin with no branch)
  const isSuperOrAdmin = user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isGlobalView = isSuperOrAdmin && !user?.branch_id;

  // Build weekly chart data from API response (handles both key spellings)
  const weeklySalesRaw = dashboardData?.weekly_sales || dashboardData?.Weekely_Sales || dashboardData?.Weekly_sales || {};
  const weeklyChartData = [
    { day: 'Mon', sales: weeklySalesRaw.monday || 0 },
    { day: 'Tue', sales: weeklySalesRaw.tuesday || 0 },
    { day: 'Wed', sales: weeklySalesRaw.wednesday || 0 },
    { day: 'Thu', sales: weeklySalesRaw.thursday || 0 },
    { day: 'Fri', sales: weeklySalesRaw.friday || 0 },
    { day: 'Sat', sales: weeklySalesRaw.saturday || 0 },
    { day: 'Sun', sales: weeklySalesRaw.sunday || 0 },
  ];

  const hourlyChartData = dashboardData?.Hourly_sales || [];

  // Peak hour: use API peak_hours when present, else derive from Hourly_sales (hour with max sales)
  const peakHourDisplay = (() => {
    const peakHours = dashboardData?.peak_hours;
    if (Array.isArray(peakHours) && peakHours.length > 0) {
      return peakHours.join(", ");
    }
    const hourly = dashboardData?.Hourly_sales || [];
    if (hourly.length > 0) {
      const maxEntry = hourly.reduce((best: any, cur: any) =>
        (cur?.sales ?? 0) > (best?.sales ?? 0) ? cur : best
      );
      return maxEntry?.hour ?? "—";
    }
    return "—";
  })();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 border border-primary/20">
              <MapPin className="h-3 w-3" />
              {branchLabel}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 border ${sseConnected
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-slate-100 text-slate-400 border-slate-200"
              }`}>
              {sseConnected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isGlobalView ? (
          // Global summary stats for Admin/SuperAdmin (no branch_id)
          <>
            <StatCard
              title="Total Network Sales"
              value={`Rs.${dashboardData?.total_sales?.toLocaleString() || 0}`}
              icon={DollarSign}
            />
            <StatCard
              title="Total Branches"
              value={dashboardData?.total_branch || 0}
              icon={ShoppingBag}
            />
            <StatCard
              title="Total Users"
              value={dashboardData?.total_user || 0}
              icon={TrendingUp}
            />
            <StatCard
              title="Total Orders"
              value={dashboardData?.total_count_order || 0}
              icon={ShoppingBag}
              subtitle={`Avg: Rs.${dashboardData?.average_order_value?.toFixed(0) || 0}`}
            />
          </>
        ) : (
          // Branch-specific stats
          <>
            <StatCard
              title="Today's Sales"
              value={`Rs.${dashboardData?.today_sales?.toLocaleString() || 0}`}
              icon={DollarSign}
              trend={{ value: Number(Math.abs(dashboardData?.sales_percent || 0).toFixed(1)), isPositive: (dashboardData?.sales_percent || 0) >= 0 }}
            />
            <StatCard
              title="Total Orders"
              value={dashboardData?.total_orders || 0}
              icon={ShoppingBag}
              trend={{ value: Number(Math.abs(dashboardData?.order_percent || 0).toFixed(1)), isPositive: (dashboardData?.order_percent || 0) >= 0 }}
            />
            <StatCard
              title="Avg Order Value"
              value={`Rs.${dashboardData?.avg_orders ? Number(dashboardData.avg_orders).toFixed(0) : 0}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Peak Hour"
              value={peakHourDisplay}
              icon={Clock}
              subtitle="Busiest today"
            />
          </>
        )}
      </div>

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="card-elevated p-8">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-black uppercase tracking-tight">Sales by Category (All Time)</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Revenue split by type</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(dashboardData?.total_sales_per_category || []).map((item: any) => ({
                  name: item.product__category__name || 'Unknown',
                  value: parseFloat(String(item.category_total_sales || 0)) || 0,
                  percent: parseFloat(String(item.category_percent || 0)) || 0
                }))}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
              >
                <XAxis type="number" hide domain={[0, 'auto']} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [`Rs.${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} isAnimationActive={false}>
                  {(dashboardData?.total_sales_per_category || []).map((_: any, index: number) => (
                    <Cell key={`cell-cat-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {(dashboardData?.total_sales_per_category || []).map((item: any, index: number) => (
              <div key={item.product__category__name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/80 border border-slate-100 shadow-sm">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">{item.product__category__name}</span>
                <span className="text-[10px] font-black text-slate-900 border-l border-slate-200 pl-2 ml-1">{Number(item.category_percent || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Kitchen Type */}
        <div className="card-elevated p-8">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-black uppercase tracking-tight">Sales by Kitchen Type (All Time)</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Kitchen split</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(dashboardData?.sales_by_kitchen_type || []).map((p: any) => ({
                    ...p,
                    total_amount: parseFloat(String(p.total_amount || 0)) || 0
                  }))}
                  dataKey="total_amount"
                  nameKey="product__category__kitchentype__name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {(dashboardData?.sales_by_kitchen_type || []).map((_: any, index: number) => (
                    <Cell key={`cell-kt-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`Rs.${Number(value).toLocaleString()}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-2">
            {(dashboardData?.sales_by_kitchen_type || []).map((item: any, index: number) => (
              <div key={item.product__category__kitchentype__name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                  />
                  <span className="text-[10px] font-black uppercase text-slate-500">{item.product__category__kitchentype__name || 'Other'}</span>
                </div>
                <span className="text-xs font-black text-slate-900">Rs.{Number(item.total_amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="card-elevated p-8">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-black uppercase tracking-tight">Payment Methods (All Time)</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Transaction spread</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(dashboardData?.sales_by_payment_method || []).map((p: any) => ({
                    ...p,
                    total_amount: parseFloat(String(p.total_amount || 0)) || 0
                  }))}
                  dataKey="total_amount"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {(dashboardData?.sales_by_payment_method || []).map((_: any, index: number) => (
                    <Cell key={`cell-payment-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`Rs.${Number(value).toLocaleString()}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-2">
            {(dashboardData?.sales_by_payment_method || []).slice(0, 3).map((item: any, index: number) => (
              <div key={item.payment_method} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                  />
                  <span className="text-[10px] font-black uppercase text-slate-500">{item.payment_method?.toLowerCase()}</span>
                </div>
                <span className="text-xs font-black text-slate-900">Rs.{Number(item.total_amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Trend Row */}
      <div className="card-elevated p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Today's Sales Trend (Hourly)</h3>
            <p className="text-xs text-muted-foreground">Hourly performance (8 AM - 8 PM)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hourlyChartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `Rs.${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`Rs.${value.toLocaleString()}`, 'Sales']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floors in current branch */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Floors</h3>
            <div className="flex items-center gap-2">
              <NavLink
                to="/admin/dashboard/tables"
                className="p-1.5 hover:bg-primary/10 rounded-md text-primary transition-colors"
                title="Go to Table Management"
              >
                <ExternalLink className="h-4 w-4" />
              </NavLink>
              <Layers className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Floors in this branch</p>
          {floors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No floors configured. Add floors in Table Management.</p>
          ) : (
            <div className="space-y-2">
              {floors.map((floor: any) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                >
                  <span className="font-medium text-foreground">{floor.name || `Floor #${floor.id}`}</span>
                  <span className="text-sm text-muted-foreground">
                    {floor.table_count ?? 0} table{(floor.table_count ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Selling Items</h3>
            <Coffee className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {(dashboardData?.top_selling_items || []).map((item: any, index: number) => (
              <div key={item.product__name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.product__name}</p>
                    <p className="text-xs text-muted-foreground">{item.total_orders} orders</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card-elevated p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Server</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      <p className="text-muted-foreground text-xs">Syncing recent sales...</p>
                    </div>
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No recent orders found.
                  </td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors text-xs md:text-sm cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4 font-bold text-foreground">
                    {order.invoice_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[10px] uppercase text-muted-foreground">{order.branch_name}</span>
                      <span className="text-xs">{order.description || order.invoice_description || 'General Sale'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                      {order.items?.reduce((acc: number, item: any) => acc + (parseFloat(item.quantity) || 0), 0) || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.created_by_name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={(order.payment_status || "PENDING").toLowerCase()} className="shadow-none border h-6 px-2.5" />
                  </td>
                  <td className="px-6 py-4 text-right font-black text-primary">
                    Rs.{order.total_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invoice {selectedOrder?.invoice_number}</DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase">Branch</p>
                    <p className="font-medium">{selectedOrder.branch_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase">Created By</p>
                    <p className="font-medium">{selectedOrder.created_by_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase">Date/Time</p>
                    <p className="font-medium">{selectedOrder.created_at}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase">Payment Status</p>
                    <StatusBadge status={selectedOrder.payment_status.toLowerCase()} />
                  </div>
                </div>

                {selectedOrder.description && (
                  <div className="bg-muted/30 p-2 rounded text-xs italic">
                    <p className="text-muted-foreground font-bold text-[9px] uppercase mb-1">Description</p>
                    {selectedOrder.description}
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-widest">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{item.quantity}× {item.product_name}</span>
                        </div>
                        <span className="font-medium">Rs.{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">No items recorded</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs.{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>Rs.{selectedOrder.tax_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-Rs.{selectedOrder.discount}</span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-black text-primary">Rs.{selectedOrder.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-success">
                    <span>Paid Amount</span>
                    <span>Rs.{selectedOrder.paid_amount}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
