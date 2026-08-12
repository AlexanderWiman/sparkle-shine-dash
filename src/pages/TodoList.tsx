import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  display_name: string;
  username: string;
}

export default function TodoList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState<string>('');

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Todo[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username')
        .order('display_name');
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, description, assignedTo }: { title: string; description: string; assignedTo: string | null }) => {
      const { error } = await supabase.from('todos').insert({
        title,
        description: description || null,
        assigned_to: assignedTo === '__none__' ? null : assignedTo,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewAssignedTo('');
      toast.success('Uppgift skapad');
    },
    onError: () => {
      toast.error('Kunde inte skapa uppgift');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('todos')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          completed_by: completed ? user!.id : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => {
      toast.error('Kunde inte uppdatera uppgift');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Uppgift raderad');
    },
    onError: () => {
      toast.error('Kunde inte radera uppgift');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate({ 
      title: newTitle.trim(), 
      description: newDescription.trim(),
      assignedTo: newAssignedTo === '__none__' ? null : (newAssignedTo || null)
    });
  };

  const getProfileName = (userId: string | null) => {
    if (!userId) return null;
    const profile = profiles?.find(p => p.id === userId);
    return profile?.display_name || null;
  };

  const incompleteTodos = todos?.filter(t => !t.completed) || [];
  const completedTodos = todos?.filter(t => t.completed) || [];

  const renderTodoItem = (todo: Todo, isCompleted: boolean) => {
    const assigneeName = getProfileName(todo.assigned_to);
    
    return (
      <div
        key={todo.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
          isCompleted ? 'bg-muted/50 opacity-75' : 'bg-card hover:bg-accent/50'
        }`}
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => 
            toggleMutation.mutate({ id: todo.id, completed: checked as boolean })
          }
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {todo.title}
            </p>
            {assigneeName && (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {assigneeName}
              </Badge>
            )}
          </div>
          {todo.description && (
            <p className={`text-sm text-muted-foreground mt-1 ${isCompleted ? 'line-through' : ''}`}>
              {todo.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {isCompleted && todo.completed_at
              ? `Slutförd ${format(new Date(todo.completed_at), 'PPP', { locale: sv })}`
              : `Skapad ${format(new Date(todo.created_at), 'PPP', { locale: sv })}`
            }
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(todo.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-2 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Att göra</h1>
            <p className="text-muted-foreground">Hantera uppgifter och checklistor</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ny uppgift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skapa ny uppgift</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Vad behöver göras?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beskrivning (valfritt)</Label>
                  <Textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Lägg till mer detaljer..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Tilldela till (valfritt)</Label>
                  <Select value={newAssignedTo || '__none__'} onValueChange={setNewAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj användare..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Ingen tilldelad</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.display_name} ({profile.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Skapa
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Incomplete todos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Att göra ({incompleteTodos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {incompleteTodos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Inga uppgifter att göra</p>
                ) : (
                  <div className="space-y-3">
                    {incompleteTodos.map((todo) => renderTodoItem(todo, false))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed todos */}
            {completedTodos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Slutförda ({completedTodos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedTodos.map((todo) => renderTodoItem(todo, true))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
