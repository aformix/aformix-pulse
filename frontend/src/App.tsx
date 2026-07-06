import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { SEO } from './pages/SEO';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const router = createBrowserRouter([
  // Auth Routes — public, with dedicated clean layout
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // Protected Routes — require authentication
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/projects', element: <Projects /> },
          { path: '/seo', element: <SEO /> },
          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },

  // Catch-all redirect
  { path: '*', element: <Navigate to="/" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
