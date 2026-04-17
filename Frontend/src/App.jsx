import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';

// --- CUSTOMER IMPORTS ---
import LandingPage from './pages/Customer/LandingPage';
import MyOrders from './pages/Customer/MyOrders';
import FabricSearch from './pages/Customer/FabricSearch';
import FabricDetails from './pages/Customer/FabricDetails';

// --- TAILOR IMPORTS ---
import TailorLandingPage from './pages/Tailor/TailorLandingPage';

// --- SUPPLIER IMPORTS ---
import SupplierDashboard from './pages/Supplier/SupplierDashboard';
import AddFabric from './pages/Supplier/AddFabric';
import EditFabric from './pages/Supplier/EditFabric';
import SupplierOrders from './pages/Supplier/SupplierOrders';

// --- IMPORT THE UI PROVIDER ---
import { UiProvider } from './context/UiContext'; 

// --- 1. Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// --- 2. Role-Based Dashboard Switcher ---
const RoleBasedDashboard = () => {
  const userString = localStorage.getItem('userInfo');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'Supplier') return <SupplierDashboard />;
  if (user.role === 'Customer') return <LandingPage />;
  if (user.role === 'Tailor') return <TailorLandingPage />;

  return <div style={{color:'white'}}>Unknown Role</div>;
};

function App() {
  return (
    <Router>
      <UiProvider>
      
        <div className="app-container">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* PROTECTED ROUTES */}
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/buy-fabric" element={<ProtectedRoute><FabricSearch /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><FabricDetails /></ProtectedRoute>} />

            {/* SUPPLIER ROUTES */}
            <Route path="/add-fabric" element={<ProtectedRoute><AddFabric /></ProtectedRoute>} />
            <Route path="/edit-fabric/:id" element={<ProtectedRoute><EditFabric /></ProtectedRoute>} />
            <Route path="/supplier/orders" element={<ProtectedRoute><SupplierOrders /></ProtectedRoute>} />

            {/* TAILOR ROUTES */}
            <Route path="/tailor/dashboard" element={<ProtectedRoute><TailorLandingPage /></ProtectedRoute>} />

            {/* SHARED DASHBOARD */}
            <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
          </Routes>
        </div>

      </UiProvider>
    </Router>
  );
}

export default App;