'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Registered successfully. You can now log in!');
        setEmail('');
        setUsername('');
        setPassword('');
        setTimeout(() => router.push('/login'), 2000); // auto-redirect to login
      } else {
        setError(data.detail || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white flex flex-col items-center justify-center px-4 py-10 relative">
      
      {/* Gradient Zyvia Logo in Top Left */}
      <div className="absolute top-6 left-6 text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
        Zyvia ✨
      </div>

      {/* Register Form */}
      <form
        onSubmit={handleRegister}
        className="bg-zinc-800/70 backdrop-blur-md w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-zinc-700 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Create your account</h2>

        {error && <p className="text-red-500 text-sm text-center -mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center -mt-2">{success}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-zinc-700 placeholder-zinc-400 text-white rounded-xl border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 bg-zinc-700 placeholder-zinc-400 text-white rounded-xl border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-zinc-700 placeholder-zinc-400 text-white rounded-xl border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pink-500 hover:bg-pink-600 transition duration-200 text-white font-semibold rounded-xl shadow-lg"
        >
          Register
        </button>

        <p className="text-sm text-center text-zinc-400 pt-2">
          Already have an account?{' '}
          <a href="/login" className="text-pink-400 hover:underline font-medium">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
