import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import Dashboard from "./pages/dashboard/dashboard";
import MainLayout from "./components/mainLayout";
import Marketplace from "./pages/marketPlace/marketPlace";
import RequestsPage from "./pages/request/request";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />}
      />

      {/* Protected Routes inside MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Child routes of MainLayout */}
        <Route index element={<Dashboard />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="requests" element={<RequestsPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<div className="p-8">404 Not Found</div>} />
    </Routes>
  );
}

export default App;
