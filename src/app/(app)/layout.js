'use client';
import { useSession } from 'next-auth/react';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#050505] shadow-2xl relative overflow-x-hidden flex flex-col pb-24 border-x border-[#1A1A1E]">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
