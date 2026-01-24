import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Waiter Pages
import TableSelection from "./pages/waiter/TableSelection";
import OrderEntry from "./pages/waiter/OrderEntry";
import Checkout from "./pages/waiter/Checkout";
import OrderStatus from "./pages/waiter/OrderStatus";
import PaymentCollection from "./pages/waiter/PaymentCollection";

// Counter Pages
import CounterPOS from "./pages/counter/CounterPOS";
import CounterOrders from "./pages/counter/CounterOrders";

// Kitchen Pages
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

// Admin Pages & Layout
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import SuperAdminOverview from "./pages/superadmin/SuperAdminOverview";
import SuperAdminBranches from "./pages/superadmin/SuperAdminBranches";
import SuperAdminAnalytics from "./pages/superadmin/SuperAdminAnalytics";
import SuperAdminAccess from "./pages/superadmin/SuperAdminAccess";
import SuperAdminSettings from "./pages/superadmin/SuperAdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Main Entry & Super Admin */}
          <Route path="/" element={<Login />} />
          <Route path="/super-admin" element={<SuperAdminLogin />} />

          {/* Super Admin Protected Routes */}
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminOverview />} />
            <Route path="/super-admin/branches" element={<SuperAdminBranches />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/super-admin/access" element={<SuperAdminAccess />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Direct Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Waiter Routes */}
          <Route path="/waiter" element={<Login />} />
          <Route path="/waiter/tables" element={<TableSelection />} />
          <Route path="/waiter/order/:tableNumber" element={<OrderEntry />} />
          <Route path="/waiter/checkout" element={<Checkout />} />
          <Route path="/waiter/orders" element={<OrderStatus />} />
          <Route path="/waiter/payment" element={<PaymentCollection />} />

          {/* Counter Routes */}
          <Route path="/counter" element={<Login />} />
          <Route path="/counter/pos" element={<CounterPOS />} />
          <Route path="/counter/orders" element={<CounterOrders />} />

          {/* Kitchen Routes */}
          <Route path="/kitchen" element={<Login />} />
          <Route path="/kitchen/display" element={<KitchenDisplay />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
