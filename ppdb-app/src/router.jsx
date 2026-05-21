import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import HalamanAuth from "./pages/siswa/HalamanAuth";
import Dashboard from "./pages/siswa/Dashboard";
import FormPendaftaran from "./pages/siswa/FormPendaftaran";
import StatusDokumen from "./pages/siswa/StatusDokumen";
import HasilSeleksi from "./pages/siswa/HasilSeleksi";
import LoginAdmin from "./pages/admin/LoginAdmin";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DataPendaftar from "./pages/admin/DataPendaftar";
import VerifikasiDokumen from "./pages/admin/VerifikasiDokumen";
import HasilSeleksiAdmin from "./pages/admin/HasilSeleksiAdmin";
import KelolaSekolah from "./pages/admin/KelolaSekolah";

/**
 * Protected Route Wrapper
 * Checks if user is logged in before allowing access
 */
function ProtectedRoute({ element, isLoggedIn, loginPath }) {
  return isLoggedIn ? element : <Navigate to={loginPath} replace />;
}

/**
 * Create router with all application routes
 * @param {Object} authState - Current auth state { isSiswaLoggedIn, isAdminLoggedIn, siswa }
 * @returns {Router} React Router instance
 */
export function createAppRouter(authState) {
  const { isSiswaLoggedIn, isAdminLoggedIn, siswa } = authState || {};

  return createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        // Student routes
        {
          path: "/",
          element: isSiswaLoggedIn ? <Navigate to="/dashboard" replace /> : <HalamanAuth />,
        },
        {
          path: "/dashboard",
          element: isSiswaLoggedIn ? <Dashboard /> : <Navigate to="/" replace />,
        },
        {
          path: "/daftar",
          element: isSiswaLoggedIn ? <FormPendaftaran /> : <Navigate to="/" replace />,
        },
        {
          path: "/dokumen",
          element: isSiswaLoggedIn ? <StatusDokumen /> : <Navigate to="/" replace />,
        },
        {
          path: "/hasil",
          element: isSiswaLoggedIn ? <HasilSeleksi /> : <Navigate to="/" replace />,
        },

        // Admin routes
        {
          path: "/admin",
          children: [
            {
              path: "login",
              element: isAdminLoggedIn ? <Navigate to="/admin/dashboard" replace /> : <LoginAdmin />,
            },
            {
              path: "dashboard",
              element: isAdminLoggedIn ? <DashboardAdmin /> : <Navigate to="/admin/login" replace />,
            },
            {
              path: "pendaftar",
              element: isAdminLoggedIn ? <DataPendaftar /> : <Navigate to="/admin/login" replace />,
            },
            {
              path: "dokumen",
              element: isAdminLoggedIn ? <VerifikasiDokumen /> : <Navigate to="/admin/login" replace />,
            },
            {
              path: "hasil",
              element: isAdminLoggedIn ? <HasilSeleksiAdmin /> : <Navigate to="/admin/login" replace />,
            },
            {
              path: "sekolah",
              element: isAdminLoggedIn ? <KelolaSekolah /> : <Navigate to="/admin/login" replace />,
            },
          ],
        },

        // Catch all - redirect to home
        {
          path: "*",
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ]);
}

export default createAppRouter;
