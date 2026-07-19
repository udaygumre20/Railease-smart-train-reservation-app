import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ============================================================
// 404 — Not Found Page
// ============================================================

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <div className="rounded-[var(--radius-2xl)] bg-warning-50 p-5 text-warning-600">
        <MapPin className="h-12 w-12" />
      </div>
      <h1 className="font-display text-4xl font-bold text-text-primary">404</h1>
      <p className="max-w-md text-text-secondary">
        Oops! The page you&apos;re looking for seems to have departed. Let&apos;s get you back on track.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="outline" onClick={() => void navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => void navigate('/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
