import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Ange ditt användarnamn');
      return;
    }

    setIsLoading(true);

    try {
      const email = `${username.toLowerCase()}@internal.washap.se`;
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success('Återställningslänk skickad!');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error('Kunde inte skicka återställningslänk. Kontrollera användarnamnet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Kolla din e-post</CardTitle>
            <CardDescription>
              Om användarnamnet finns i systemet har vi skickat en återställningslänk.
              Klicka på länken i e-posten för att återställa ditt lösenord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tillbaka till inloggning
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Glömt lösenord</CardTitle>
          <CardDescription>
            Ange ditt användarnamn så skickar vi en återställningslänk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Användarnamn</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ange ditt användarnamn"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Skickar...
                </>
              ) : (
                'Skicka återställningslänk'
              )}
            </Button>

            <Link to="/login">
              <Button variant="ghost" className="w-full mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tillbaka till inloggning
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
