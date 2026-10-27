import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(api.getSession); // restores login after refresh
  useEffect(() => {
    const expired = () => setSession(null);
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  const start = (s) => { api.saveSession(s); setSession(s); };
  const value = {
    user: session?.user || null,
    name: session ? session.user.email.split('@')[0] : '',
    login: async (e, p) => start(await api.login(e, p)),
    register: async (e, p) => { const s = await api.register(e, p); if (s) start(s); return !!s; },
    logout: async () => { try { await api.logout(session.access_token); } catch { /* clear anyway */ } start(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
