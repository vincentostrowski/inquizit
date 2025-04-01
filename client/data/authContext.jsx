import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const anonymousLogin = async () => {
    const { data: anonSession, error } = await supabase.auth.signInAnonymously();
    if (anonSession?.session) {
      setSession(anonSession.session);
      setUser(anonSession.session.user);
    } else if (error) {
      console.error('Anonymous login error:', error.message);
    } 
  }

  useEffect(() => {
    const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
  
        if (session) {
          setSession(session);
          setUser(session.user);
        } 

        setAuthLoading(false);
      };
  
    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, authLoading, anonymousLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
