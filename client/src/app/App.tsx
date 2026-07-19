import { AppProviders } from './providers';
import { AppRouter } from './router';

// ============================================================
// Root App Component
// ============================================================

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
