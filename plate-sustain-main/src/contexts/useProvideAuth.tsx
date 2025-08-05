
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/lib/types";

export function useProvideAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const login = signIn;

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
          },
        },
      });

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: userData.name,
              role: userData.role,
              address: userData.address,
              phone: userData.phone,
              // profile_image is not a column in the profiles table
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { error: profileError };
        }
      }

      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const userData = { name, role };
    const { error } = await signUp(email, password, userData);
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = signOut;

  const refreshUser = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        if (profile) {
          const userRole = userData.user.user_metadata.role || profile.role || 'donor';
          
          setCurrentUser({
            id: userData.user.id,
            email: userData.user.email || '',
            name: profile.name,
            role: userRole as UserRole,
            address: profile.address,
            phone: profile.phone,
            profileImage: null,
          });
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          if (session?.user) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error("Error fetching profile:", error);
              setIsLoading(false);
              setIsAuthenticated(false);
              return;
            }

            if (profile) {
              const userRole = session.user.user_metadata.role || profile.role || 'donor';

              setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name,
                role: userRole as UserRole,
                address: profile.address,
                phone: profile.phone,
                profileImage: null,
              });
              setIsAuthenticated(true);
            }
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshUser,
    login,
    register,
    logout,
  };
}
