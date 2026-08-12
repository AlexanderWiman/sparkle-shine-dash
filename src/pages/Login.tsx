import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import washapLogo from '@/assets/washap-logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Fyll i alla fält',
        description: 'Användarnamn och lösenord krävs',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Ogiltigt lösenord',
        description: 'Lösenordet måste vara minst 8 tecken',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(username, password);
    
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Inloggning misslyckades',
        description: 'Felaktigt användarnamn eller lösenord',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Välkommen!',
        description: 'Du är nu inloggad',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full bg-[#2e8b57] py-8 flex justify-center">
        <img 
          src={washapLogo} 
          alt="Washap" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Logga in</CardTitle>
            <CardDescription className="text-center">
              Ange ditt användarnamn och lösenord
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Användarnamn</Label>
              <Input
                id="username"
                type="text"
                placeholder="dittanvändarnamn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Lösenord</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Glömt lösenord?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Minst 8 tecken"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-[#2e8b57] hover:bg-[#247047]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loggar in...
                </>
              ) : (
                'Logga in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
