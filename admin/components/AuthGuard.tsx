import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
      setLoading(false);
    };
    init();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg('Credenciales invalidas.');
      return;
    }
    setIsAuthed(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Verificando acceso...
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Acceso Backoffice</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
              <input
                type="password"
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMsg && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                {errorMsg}
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
