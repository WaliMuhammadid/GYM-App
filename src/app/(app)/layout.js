'use client';
import { useSession } from 'next-auth/react';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }) {
  const { data: session, status } = useSession();

  return (
    <div className="w-full min-h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#050505] shadow-2xl relative overflow-x-hidden flex flex-col pb-24 border-x border-[#1A1A1E]">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
