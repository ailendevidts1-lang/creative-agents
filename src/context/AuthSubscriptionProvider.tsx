import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Tier = "Free" | "Builder" | "Premium" | "Enterprise" | null;

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: Tier;
  subscription_end?: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  subscription: SubscriptionState;
  subscriptionLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  startCheckout: (tier: Exclude<Tier, "Free" | null>) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_EMAIL = "ailen.devidts@gmail.com"; // Admin bypass

export const AuthSubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: "Free",
    subscription_end: null,
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(false);

  const isAdmin = useMemo(() => !!user && user.email?.toLowerCase() === ADMIN_EMAIL, [user]);

  const refreshSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      if (!session?.access_token) {
        setSubscriptionLoading(false);
        return;
      }
      // Admin bypass
      if (isAdmin) {
        setSubscription({ subscribed: true, subscription_tier: "Enterprise", subscription_end: null });
        setSubscriptionLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: {},
      });
      if (error) throw error;
      setSubscription({
        subscribed: !!data?.subscribed,
        subscription_tier: (data?.subscription_tier as Tier) ?? "Free",
        subscription_end: data?.subscription_end ?? null,
      });
    } catch (e) {
      console.error("Failed to refresh subscription:", e);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setTimeout(() => refreshSubscription(), 0);
    }
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setTimeout(() => refreshSubscription(), 0);
    }
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription({ subscribed: false, subscription_tier: "Free", subscription_end: null });
  };

  const startCheckout = async (tier: Exclude<Tier, "Free" | null>) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url as string, "_blank");
    } catch (e) {
      console.error("Checkout failed:", e);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", { body: {} });
      if (error) throw error;
      if (data?.url) window.open(data.url as string, "_blank");
    } catch (e) {
      console.error("Customer portal failed:", e);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => refreshSubscription(), 0);
      } else {
        setSubscription({ subscribed: false, subscription_tier: "Free", subscription_end: null });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) setTimeout(() => refreshSubscription(), 0);
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isAdmin,
    subscription,
    subscriptionLoading,
    login,
    signUp,
    logout,
    refreshSubscription,
    startCheckout,
    openCustomerPortal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthSub = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthSub must be used within AuthSubscriptionProvider");
  return ctx;
};
