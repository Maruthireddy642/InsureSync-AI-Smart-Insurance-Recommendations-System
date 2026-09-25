import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";

import HealthProfile from "./pages/HealthProfile";
import Recommendations from "./pages/Recommendations";
import ClaimsPriorAuth from "./pages/ClaimsPriorAuth";
import Advisor from "./pages/Advisor";

function Home() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
      return <AdminAnalytics />;

    case "provider":
      return <ProviderDashboard />;

    default:
      return <CustomerDashboard />;
  }
}

export default function App() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* CUSTOMER ROUTES */}

      <Route
        path="/health-profile"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Layout>
              <HealthProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Layout>
              <Recommendations />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workflow"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Layout>
              <ClaimsPriorAuth />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* PROVIDER ROUTE */}

      <Route
        path="/provider"
        element={
          <ProtectedRoute roles={["provider"]}>
            <Layout>
              <ProviderDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTE */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Layout>
              <AdminAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Shared Route */}

      <Route
        path="/advisor"
        element={
          <ProtectedRoute>
            <Layout>
              <Advisor />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}