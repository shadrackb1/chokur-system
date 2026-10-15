import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { signIn, loading, isOnline } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF] px-4">
        <div className="w-full max-w-md bg-white border border-[#DDD6C7] p-8 rounded">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#111111]">Chokur System</h1>
            <p className="text-[#5F5E5E] mt-1">KCSE Academic Grading Ledger</p>
          </div>
          <div className="bg-[#FEF3E2] border border-[#C2410C] rounded p-4 mb-6">
            <p className="text-sm text-[#C2410C] text-center">
              <strong>Offline Mode:</strong> Supabase not configured. Using local IndexedDB storage.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#C2410C] text-[#FEF9EF] py-3 rounded font-semibold hover:opacity-95 transition-opacity"
          >
            Continue Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF] px-4">
      <div className="w-full max-w-md bg-white border border-[#DDD6C7] p-8 rounded">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Welcome Back</h1>
          <p className="text-[#5F5E5E] mt-1">Sign in to your Chokur account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FEF3E2] border border-[#C2410C] rounded text-sm text-[#C2410C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C] bg-white"
              placeholder="teacher@school.ac.ke"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C] bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || loading}
            className="w-full bg-[#C2410C] text-[#FEF9EF] py-3 rounded font-semibold hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5F5E5E]">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#C2410C] font-medium hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};