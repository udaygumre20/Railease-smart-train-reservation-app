import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

// ============================================================
// App Router
// ============================================================

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
