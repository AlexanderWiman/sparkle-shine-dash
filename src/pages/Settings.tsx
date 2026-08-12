import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Key, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    loadMaintenanceMode();
  }, []);

  const loadMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error) throw error;
      const value = data.value as { enabled: boolean; message: string };
      setMaintenanceMode(value.enabled);
    } catch (error) {
      console.error('Error loading maintenance mode:', error);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    setMaintenanceLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: {
            enabled,
            message: 'Underhållsarbete pågår just nu. Vänligen försök igen senare.'
          }
        })
        .eq('key', 'maintenance_mode');

      if (error) throw error;

      setMaintenanceMode(enabled);
      toast.success(enabled ? 'Underhållsläge aktiverat' : 'Underhållsläge avaktiverat');
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Kunde inte uppdatera underhållsläge');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
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

    if (currentPassword === newPassword) {
      toast.error('Det nya lösenordet måste skilja sig från det nuvarande');
      return;
    }

    setIsLoading(true);

    try {
      // Verify current password by attempting to sign in
      const email = `${profile?.username}@internal.washap.se`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Felaktigt nuvarande lösenord');
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      toast.success('Lösenordet har uppdaterats');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.message?.includes('same_password')) {
        toast.error('Det nya lösenordet måste skilja sig från det nuvarande');
      } else {
        toast.error('Ett fel uppstod vid lösenordsbyte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Inställningar</h1>
          <p className="text-muted-foreground">
            Hantera ditt konto och dina inställningar
          </p>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode Card - Only for admins */}
          {profile?.username && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Underhållsläge
                </CardTitle>
                <CardDescription>
                  Aktivera underhållsläge för att visa en banner till användare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Underhållsbanner</Label>
                    <p className="text-sm text-muted-foreground">
                      Visar en varningsbanner på alla sidor när aktiverad
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={toggleMaintenanceMode}
                    disabled={maintenanceLoading}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Kontoinformation</CardTitle>
              <CardDescription>
                Din grundläggande kontoinformation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Användarnamn</Label>
                <Input value={profile?.username || ''} disabled />
              </div>
              <div>
                <Label>Namn</Label>
                <Input value={profile?.display_name || ''} disabled />
              </div>
              {profile?.phone && (
                <div>
                  <Label>Telefon</Label>
                  <Input value={profile.phone} disabled />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Byt lösenord
              </CardTitle>
              <CardDescription>
                Uppdatera ditt lösenord för att hålla ditt konto säkert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ange nuvarande lösenord"
                    required
                    disabled={isLoading}
                  />
                </div>

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
                  <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
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

                <Button type="submit" disabled={isLoading}>
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
      </div>
    </Layout>
  );
}
