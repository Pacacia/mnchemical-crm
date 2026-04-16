import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken, getStoredUser, clearToken } from './api/auth';
import type { AuthUser } from './api/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import OrderList from './pages/OrderList';
import OrderForm from './pages/OrderForm';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import AttendanceToday from './pages/AttendanceToday';
import AttendanceLog from './pages/AttendanceLog';
import MonthlyReport from './pages/MonthlyReport';
import LeaveManagement from './pages/LeaveManagement';
import ShipmentList from './pages/ShipmentList';
import TransportList from './pages/TransportList';
import WarehouseInventory from './pages/WarehouseInventory';
import MaterialConsumption from './pages/MaterialConsumption';
import Accounting from './pages/Accounting';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const DEV_USER: AuthUser = { id: '', username: 'dev', fullName: 'Developer', email: null, role: 'Admin' };

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getToken() ? getStoredUser() : null);
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    if (user) { setChecking(false); return; }
    let cancelled = false;
    fetch('/api/customers').then(r => {
      if (cancelled) return;
      if (r.ok) { setUser(DEV_USER); }
      setChecking(false);
    }).catch(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLogin = () => setUser(getStoredUser());
  const handleLogout = () => { clearToken(); setUser(null); queryClient.clear(); };

  if (checking) return null;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id/edit" element={<OrderForm />} />
            <Route path="/shipments" element={<ShipmentList />} />
            <Route path="/transport" element={<TransportList />} />
            <Route path="/warehouse" element={<WarehouseInventory />} />
            <Route path="/warehouse/consumption" element={<MaterialConsumption />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/attendance" element={<AttendanceToday />} />
            <Route path="/attendance/log" element={<AttendanceLog />} />
            <Route path="/attendance/report" element={<MonthlyReport />} />
            <Route path="/leave" element={<LeaveManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
