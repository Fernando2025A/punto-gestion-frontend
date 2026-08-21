import { Navigate, Route, Routes } from "react-router-dom";
import { Start } from "./pages/Start/Start";
import { Register } from "./pages/Register/Register";
import { Login } from "./pages/Login/Login";
import { Dashboard } from "./pages/Home/Dashboard";
import { ProtectedRoute } from "./protectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout/DashboardLayout";
import { Products } from "./pages/Products/Products";
import { Entries } from "./pages/StockEntry/Entries";
import { Shipments } from "./pages/StockExit/Shipments";
import { Movements } from "./pages/Movements/Movements";
import { Categories } from "./pages/Categories/Categories";
import { Suppliers } from "./pages/Suppliers/Suppliers";
import { Settings } from "./pages/Settings/Settings";
import { Reports } from "./pages/Reports/Reports";
import { ToastProvider } from "./provider/ToastProvider"; // O ToastContext según como lo llamaste
import { Employees } from "./pages/Employees/Employees";
import { BusinessDashboard } from "./pages/Business/Business";
import { AlertsProvider } from "./provider/AlertsProvier";
import { Admin } from "./pages/Admin/Admin";

function App() {
  return (
    // 1. Envolvemos toda la aplicación (o las rutas protegidas) con el Provider
    <ToastProvider>
      <AlertsProvider>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Start />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas con Layout de Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/business" element={<BusinessDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AlertsProvider>
    </ToastProvider>
  );
}

export default App;