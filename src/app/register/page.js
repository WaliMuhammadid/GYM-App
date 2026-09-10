'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // Basic user
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#050505] flex flex-col pt-safe px-5 relative overflow-hidden pb-10 shadow-2xl border-x border-[#1A1A1E]">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#D0FF00]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="mt-12 mb-8">
        <Link href="/login" className="w-10 h-10 flex items-center justify-center text-white bg-[#121215] border border-[#27272A] rounded-full mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-montserrat text-3xl font-black text-white uppercase italic tracking-tighter">
          BECOME A MEMBER
        </h1>
        <p className="font-inter text-sm text-[#A1A1AA] mt-2">Join the Kinetic High-Performance System.</p>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-sm w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#FF2E54]/10 border border-[#FF2E54]/20 text-[#FF2E54] p-3 rounded-xl text-center font-inter text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="font-mono text-[10px] text-[#71717A] tracking-[0.1em] uppercase block mb-2">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">person</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#121215] border border-[#27272A] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#52525B] focus:border-[#D0FF00] outline-none transition-colors font-inter"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] text-[#71717A] tracking-[0.1em] uppercase block mb-2">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">mail</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#121215] border border-[#27272A] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#52525B] focus:border-[#D0FF00] outline-none transition-colors font-inter"
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password || !formData.name}
            className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-extrabold text-base uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8d300] transition-colors disabled:opacity-50 mt-6 shadow-[0_0_20px_rgba(208,255,0,0.2)]"
          >
            {loading ? 'PROCESSING...' : 'JOIN NOW'}
            <span className="material-symbols-outlined text-xl">person_add</span>
          </button>
        </form>
      </div>
    </div>
  );
}
