import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  facility_id: string | null;
  must_change_password: boolean;
}

interface UserRole {
  role: 'admin' | 'chef' | 'arbetare';
  facility_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  signIn: (username: string, pin: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'chef' | 'arbetare') => boolean;
  isAdmin: boolean;
  isChef: boolean;
  isArbetare: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Profile not found for user:', userId, profileError);
        // Security: If profile doesn't exist, sign out the user
        await supabase.auth.signOut();
        setProfile(null);
        setRoles([]);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, facility_id')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Security: If roles can't be fetched, sign out the user
        await supabase.auth.signOut();
        setProfile(null);
        setRoles([]);
        setLoading(false);
        return;
      }
      
      if (!rolesData || rolesData.length === 0) {
        console.error('No roles found for user:', userId);
        // Security: If user has no roles, sign out the user
        await supabase.auth.signOut();
        setProfile(null);
        setRoles([]);
        setLoading(false);
        return;
      }
      
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Security: On any error, sign out the user
      await supabase.auth.signOut();
      setProfile(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const normalizedUsername = username.toLowerCase();
      
      // Check if user is locked out due to too many failed attempts
      const { data: isLockedOut, error: lockoutCheckError } = await supabase
        .rpc('is_user_locked_out', { _username: normalizedUsername });

      if (lockoutCheckError) {
        console.error('Error checking lockout status:', lockoutCheckError);
      }

      if (isLockedOut) {
        return { 
          error: new Error('Kontot är tillfälligt låst på grund av för många misslyckade inloggningsförsök. Försök igen om 15 minuter.') 
        };
      }

      // Convert username to internal email format
      const email = `${normalizedUsername}@internal.washap.se`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: password,
      });

      // Record the login attempt
      const attemptSuccess = !error;
      const { error: recordError } = await supabase
        .rpc('record_login_attempt', { 
          _username: normalizedUsername, 
          _success: attemptSuccess 
        });

      if (recordError) {
        console.error('Error recording login attempt:', recordError);
      }

      if (error) return { error };

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    navigate('/login');
  };

  const hasRole = (role: 'admin' | 'chef' | 'arbetare') => {
    return roles.some(r => r.role === role);
  };

  const isAdmin = hasRole('admin');
  const isChef = hasRole('chef');
  const isArbetare = hasRole('arbetare');

  const refreshProfile = async () => {
    if (!user) return;
    setLoading(true);
    await fetchUserProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        signIn,
        signOut,
        hasRole,
        isAdmin,
        isChef,
        isArbetare,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
