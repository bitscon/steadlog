import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionData {
  id: string;
}

const Success = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // In a real app, you'd fetch session details from your backend
      // For now, we'll just simulate success
      setSessionData({ id: sessionId });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-8">
            Welcome to Homestead Architect! Your subscription has been activated.
            You can now start planning your dream homestead.
          </p>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevation w-full"
              onClick={() => window.location.href = 'https://myhome.homesteadarchitect.com/auth/login'}
            >
              Go to Your Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Homepage
            </Button>
          </div>

          {sessionData && (
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Order Details</h3>
              <p className="text-sm text-muted-foreground">
                Session ID: {sessionData.id}
              </p>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Need help getting started?</p>
            <a
              href="mailto:support@homesteadarchitect.com"
              className="text-primary hover:underline"
            >
              Contact our support team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
