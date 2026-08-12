import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createUser, deleteUser, resetUserPassword } from '@/lib/userApi';
import { fetchFacilities } from '@/lib/facilityApi';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Loader2, KeyRound, CheckCircle2, XCircle } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  facility_id: string | null;
}

interface UserRole {
  role: 'admin' | 'chef' | 'arbetare';
  facility_id: string | null;
}

interface UserWithRoles extends Profile {
  roles: UserRole[];
  facility_name?: string;
}

export default function UserManagement() {
  const { isAdmin, isChef } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: '',
    userName: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'arbetare' as 'admin' | 'chef' | 'arbetare',
    facility_id: '',
  });

  // Check if username is available with debounce
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    // Validate format: lowercase letters, numbers, underscores only
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('idle');
        return;
      }

      setUsernameStatus(data ? 'taken' : 'available');
    } catch (err) {
      setUsernameStatus('idle');
    }
  }, []);

  // Debounce username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [formData.username, checkUsernameAvailability]);

  // Fetch facilities from Railway backend
  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => fetchFacilities(true),
  });

  // Fetch users with roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');
      
      if (profilesError) throw profilesError;

      const usersWithRoles: UserWithRoles[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role, facility_id')
            .eq('user_id', profile.id);

          // Get facility name from Railway backend if facility_id exists
          let facility_name;
          if (profile.facility_id && facilities.length > 0) {
            const facility = facilities.find(f => f.id === profile.facility_id);
            facility_name = facility?.name;
          }

          return {
            ...profile,
            roles: roles || [],
            facility_name,
          };
        })
      );

      return usersWithRoles;
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        throw new Error('Lösenorden matchar inte');
      }

      // Validate with zod schema
      const { userCreationSchema, formatZodErrors } = await import('@/lib/validationSchemas');
      
      try {
        userCreationSchema.parse({
          username: data.username,
          display_name: data.display_name,
          phone: data.phone,
          password: data.password,
          role: data.role,
          facility_id: data.facility_id,
        });
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          throw new Error(formatZodErrors(error as any));
        }
        throw error;
      }

      return await createUser({
        username: data.username,
        display_name: data.display_name,
        phone: data.phone || undefined,
        password: data.password,
        role: data.role,
        facility_id: data.facility_id || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Användare skapad',
        description: 'Den nya användaren har skapats',
      });
      setIsDialogOpen(false);
      setFormData({
        username: '',
        display_name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'arbetare',
        facility_id: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Misslyckades',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Användare raderad',
        description: 'Användaren har raderats',
      });
      setIsDeleting(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Misslyckades',
        description: error.message,
        variant: 'destructive',
      });
      setIsDeleting(null);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      if (password !== confirmNewPassword) {
        throw new Error('Lösenorden matchar inte');
      }
      return await resetUserPassword(userId, password);
    },
    onSuccess: () => {
      toast({
        title: 'Lösenord återställt',
        description: 'Användaren måste byta lösenord vid nästa inloggning',
      });
      setResetPasswordDialog({ open: false, userId: '', userName: '' });
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Misslyckades',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (userId: string) => {
    if (confirm('Är du säker på att du vill radera denna användare?')) {
      setIsDeleting(userId);
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      chef: 'secondary',
      arbetare: 'outline',
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (!isAdmin && !isChef) {
    return (
      <Layout>
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Ingen åtkomst</CardTitle>
              <CardDescription>
                Du har inte behörighet att se denna sida.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Användarhantering</h1>
          <p className="text-muted-foreground mt-2">
            Hantera användare och deras behörigheter
          </p>
        </div>
        <div className="mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Skapa användare
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Skapa ny användare</DialogTitle>
                <DialogDescription>
                  Fyll i informationen för den nya användaren
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createUserMutation.mutate(formData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Användarnamn *</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      className={
                        usernameStatus === 'taken' || usernameStatus === 'invalid'
                          ? 'border-destructive pr-10'
                          : usernameStatus === 'available'
                          ? 'border-green-500 pr-10'
                          : 'pr-10'
                      }
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && (
                    <p className="text-xs text-destructive">Användarnamnet är redan taget</p>
                  )}
                  {usernameStatus === 'invalid' && (
                    <p className="text-xs text-destructive">Endast små bokstäver (a-z), siffror och understreck</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs text-green-600">Användarnamnet är ledigt</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Visningsnamn *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Roll *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                      {isAdmin && <SelectItem value="chef">Chef</SelectItem>}
                      <SelectItem value="arbetare">Arbetare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility_id">Anläggning *</Label>
                  <Select
                    value={formData.facility_id}
                    onValueChange={(value) => setFormData({ ...formData, facility_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj anläggning" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Lösenord *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minst 8 tecken"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Måste innehålla stor bokstav, liten bokstav, siffra och specialtecken (@$!%*?&.)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bekräfta lösenord *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Upprepa lösenordet"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      'Skapa användare'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Användare</CardTitle>
            <CardDescription>
              Lista över alla användare i systemet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Användarnamn</TableHead>
                    <TableHead>Visningsnamn</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Anläggning</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.display_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role, idx) => (
                            <span key={idx}>{getRoleBadge(role.role)}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{user.facility_name || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setResetPasswordDialog({ open: true, userId: user.id, userName: user.display_name })}
                              title="Återställ lösenord"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting === user.id}
                          >
                            {isDeleting === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => {
          setResetPasswordDialog({ ...resetPasswordDialog, open });
          if (!open) {
            setNewPassword('');
            setConfirmNewPassword('');
          }
        }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Återställ lösenord</DialogTitle>
              <DialogDescription>
                Sätt nytt lösenord för {resetPasswordDialog.userName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              resetPasswordMutation.mutate({ userId: resetPasswordDialog.userId, password: newPassword });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nytt lösenord *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minst 8 tecken"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Måste innehålla stor bokstav, liten bokstav, siffra och specialtecken (@$!%*?&.)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Bekräfta lösenord *</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Upprepa lösenordet"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Återställer...
                    </>
                  ) : (
                    'Återställ lösenord'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </Layout>
  );
}
