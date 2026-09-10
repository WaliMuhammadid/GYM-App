'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#050505] flex flex-col pt-safe px-5 relative overflow-hidden shadow-2xl border-x border-[#1A1A1E]">
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#D0FF00]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Branding */}
      <div className="flex flex-col items-center justify-center mt-20 mb-12">
        <div className="w-20 h-20 bg-[#121215] border border-[#27272A] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(208,255,0,0.15)]">
          <span className="material-symbols-outlined text-4xl text-[#D0FF00]">bolt</span>
        </div>
        <h1 className="font-montserrat text-4xl font-black text-white uppercase italic tracking-tighter text-center">
          BEAST<span className="text-[#D0FF00]">-FIT</span>
        </h1>
        <p className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-[0.3em] mt-2 text-center">High-Performance System</p>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-sm w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[#FF2E54]/10 border border-[#FF2E54]/20 text-[#FF2E54] p-3 rounded-xl text-center font-inter text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          
          <div>
            <label className="font-mono text-[10px] text-[#71717A] tracking-[0.1em] uppercase block mb-2">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272A] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#52525B] focus:border-[#D0FF00] outline-none transition-colors font-inter"
                placeholder="athlete@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] text-[#71717A] tracking-[0.1em] uppercase block mb-2">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272A] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#52525B] focus:border-[#D0FF00] outline-none transition-colors font-inter"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-base uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors disabled:opacity-50 mt-8 shadow-[0_0_20px_rgba(208,255,0,0.2)]"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO SYSTEM'}
            <span className="material-symbols-outlined text-xl">login</span>
          </button>
        </form>

        <p className="text-center font-inter text-[#71717A] text-sm mt-8">
          Not a member? <Link href="/register" className="text-[#D0FF00] hover:underline font-medium">Join the gym</Link>
        </p>
      </div>
    </div>
  );
}
