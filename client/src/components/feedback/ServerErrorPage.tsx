import { useNavigate } from 'react-router';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ============================================================
// 500 — Server Error Page
// ============================================================

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <div className="rounded-[var(--radius-2xl)] bg-danger-50 p-5 text-danger-600">
        <ServerCrash className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-bold text-text-primary">500</h1>
      <p className="max-w-md text-text-secondary">
        Our servers hit a bump. We&apos;re working on it. Please try again in a moment.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
        <Button onClick={() => void navigate('/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
