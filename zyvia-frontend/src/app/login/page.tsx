'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as auth from '@/lib/auth'; // Make sure this path is correct

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      // Adjust this based on what your API returns
      const token = data.access || data.token;

      if (res.ok && token) {
        auth.loginUser(username, token);
        console.log(`[Login] ${username} logged in successfully.`);
        router.push('/');
      } else {
        const errorMessage = data.detail || 'Invalid username or password.';
        console.warn('[Login] Failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('[Login] Unexpected error:', err);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white flex flex-col items-center justify-center px-4 py-10 relative">
      <div className="absolute top-6 left-6 text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
        Zyvia ✨
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-zinc-800/70 backdrop-blur-md w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-zinc-700 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Login to your account</h2>

        {error && (
          <p className="text-red-500 text-sm text-center -mt-2 bg-red-900/20 py-2 px-3 rounded-lg border border-red-500/30">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 bg-zinc-700 placeholder-zinc-400 text-white rounded-xl border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-zinc-700 placeholder-zinc-400 text-white rounded-xl border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pink-500 hover:bg-pink-600 transition duration-200 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center disabled:bg-pink-800 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>

        <p className="text-sm text-center text-zinc-400 pt-2">
          Don’t have an account?{' '}
          <a href="/register" className="text-pink-400 hover:underline font-medium">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
