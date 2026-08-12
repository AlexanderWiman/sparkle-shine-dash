import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Lösenorden matchar inte');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Lösenordet måste vara minst 8 tecken långt');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Lösenordet måste innehålla minst en bokstav, en siffra och ett specialtecken');
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      // Update must_change_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast.success('Lösenordet har uppdaterats');
      // Mark password as changed in this browser session to avoid redirect-loop
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('passwordChanged', 'true');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Ett fel uppstod vid lösenordsbyte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Byt lösenord</CardTitle>
          <CardDescription>
            Du måste byta ditt lösenord innan du kan fortsätta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ange nytt lösenord"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Minst 8 tecken, en bokstav, en siffra och ett specialtecken
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Bekräfta nytt lösenord"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uppdaterar...
                </>
              ) : (
                'Uppdatera lösenord'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
