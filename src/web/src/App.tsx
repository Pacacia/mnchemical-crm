import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
