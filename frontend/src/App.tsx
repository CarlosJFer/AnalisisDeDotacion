import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { setNavigate } from "./services/api.js";

// Contextos
import { AuthProvider } from "./context/AuthContext.jsx";
import CustomThemeProvider from "./context/ThemeContext.jsx";
import DashboardProvider from "./context/DashboardContext.jsx";
import NotificationProvider from "./context/NotificationContext.jsx";

// Páginas (lazy loading)
const LoginPage = lazy(() => import("./page/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./page/DashboardPage.jsx"));
const DashboardNeikeBeca = lazy(() => import("./page/DashboardNeikeBeca.jsx"));
const DashboardSAC = lazy(() => import("./page/DashboardSAC.jsx"));
const AdminPage = lazy(() => import("./page/AdminPage.jsx"));
const UserAdminPage = lazy(() => import("./page/UserAdminPage.jsx"));
const SecretariaAdminPage = lazy(
  () => import("./page/SecretariaAdminPage.jsx"),
);
const ChangePasswordPage = lazy(() => import("./page/ChangePasswordPage.jsx"));
const ComparisonPage = lazy(() => import("./page/ComparisonPage.jsx"));
const SettingsPage = lazy(() => import("./page/SettingsPage.jsx"));
const OrganigramaPage = lazy(() => import("./page/OrganigramaPage.jsx"));
const UploadPage = lazy(() => import("./page/UploadPage.jsx"));
const GestionPlantillasPage = lazy(
  () => import("./page/GestionPlantillasPage.jsx"),
);
import GestionVariablesPage from "./page/GestionVariablesPage.jsx";
const FunctionCenterPage = lazy(() => import("./page/FunctionCenterPage.jsx"));
const DebugComponent = lazy(() => import("./components/DebugComponent.jsx"));
const ToolsPage = lazy(() => import("./page/ToolsPage.jsx"));
const ExpedientesTool = lazy(() => import("./page/tools/ExpedientesTool.jsx"));
const AgrupamientoNivelesTool = lazy(
  () => import("./page/tools/AgrupamientoNivelesTool.jsx"),
);
const AgrupamientoNivelesView = lazy(
  () => import("./page/tools/AgrupamientoNivelesView.jsx"),
);
const ANUploadPage = lazy(() => import("./page/tools/ANUploadPage.jsx"));
const ABNATool = lazy(() => import("./page/tools/ABNATool.jsx"));
const AIDTool = lazy(() => import("./page/tools/AIDTool.jsx"));
const ResolucionesTool = lazy(
  () => import("./page/tools/ResolucionesTool.jsx"),
);

// Componentes
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorFallback from "./components/ErrorFallback.jsx";

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// Componente para manejar el layout condicional
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  const isLoginPage = location.pathname.startsWith("/login");

  return (
    <div className="app">
      {!isLoginPage && <Navbar />}
      <main className="main-content">
        <Suspense
          fallback={
            <div style={{ textAlign: "center", marginTop: 40 }}>
              Cargando...
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Rutas Protegidas para Usuarios */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/dashboard-neike-beca"
                element={<DashboardNeikeBeca />}
              />
              <Route path="/dashboard-sac" element={<DashboardSAC />} />
              <Route path="/comparacion" element={<ComparisonPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/organigrama" element={<OrganigramaPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/expedientes" element={<ExpedientesTool />} />
              <Route
                path="/tools/agrupamiento-niveles"
                element={<AgrupamientoNivelesTool />}
              />
              <Route
                path="/tools/agrupamiento-niveles/upload"
                element={<ANUploadPage />}
              />
              <Route
                path="/tools/agrupamiento-niveles/ver"
                element={<AgrupamientoNivelesView />}
              />
              <Route path="/tools/abna" element={<ABNATool />} />
              <Route path="/tools/aid" element={<AIDTool />} />
              <Route
                path="/tools/resoluciones"
                element={<ResolucionesTool />}
              />
            </Route>
            {/* Rutas Protegidas solo para Admins */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<UserAdminPage />} />
              <Route
                path="/admin/secretarias"
                element={<SecretariaAdminPage />}
              />
              <Route path="/admin/upload" element={<UploadPage />} />
              <Route path="/admin/organigrama" element={<OrganigramaPage />} />
              <Route
                path="/admin/variables"
                element={<GestionVariablesPage />}
              />
              <Route
                path="/admin/plantillas"
                element={<GestionPlantillasPage />}
              />
              <Route path="/admin/funciones" element={<FunctionCenterPage />} />
            </Route>
            {/* Ruta de depuración temporal */}
            <Route path="/debug" element={<DebugComponent />} />
            {/* Redirección por defecto: ahora a /organigrama */}
            <Route path="/" element={<Navigate to="/organigrama" />} />
            <Route path="*" element={<Navigate to="/organigrama" />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <CustomThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  <DashboardProvider>
                    <AppLayout />
                  </DashboardProvider>
                </NotificationProvider>
              </AuthProvider>
            </CustomThemeProvider>
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
