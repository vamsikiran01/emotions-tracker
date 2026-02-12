import { useState, useEffect } from 'react';
import { Download, Share, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center shadow-lg">
          <CardContent className="py-12">
            <CheckCircle2 className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Already Installed!</h1>
            <p className="text-sm text-muted-foreground">Sentira is running as an app on your device.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <Smartphone className="h-12 w-12 mx-auto text-primary mb-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Install Sentira</h1>
          <p className="text-sm text-muted-foreground">Add Sentira to your home screen for a native app experience — no app store needed.</p>
        </div>

        {/* Android / Desktop install */}
        {deferredPrompt && (
          <Card className="mb-6 shadow-lg border-primary/20">
            <CardContent className="p-6 text-center">
              <Button onClick={handleInstall} size="lg" className="gap-2 rounded-full px-8 w-full sm:w-auto">
                <Download className="h-5 w-5" /> Install Sentira
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS instructions */}
        {isIOS && (
          <Card className="mb-6 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share className="h-4 w-4 text-primary" /> How to Install on iPhone / iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Tap the Share button (□↑) at the bottom of Safari',
                'Scroll down and tap "Add to Home Screen"',
                'Tap "Add" in the top right corner',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <p className="text-sm text-foreground pt-1">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* General fallback */}
        {!deferredPrompt && !isIOS && (
          <Card className="mb-6 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" /> How to Install
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                In your browser's address bar or menu, look for an install icon or "Install app" option.
              </p>
              <p className="text-xs text-muted-foreground">
                On Chrome: Click the install icon (⊕) in the address bar. On Edge: Menu → Apps → Install this site as an app.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Works offline after installation. Your data stays on your device. 🔒
        </p>
      </div>
    </div>
  );
};

export default Install;
