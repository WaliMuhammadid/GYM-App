'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Basic role check (redirect happens in middleware, but just in case)
  if (session && session.user.role !== 'admin') {
    return <div className="min-h-screen bg-[#050505] text-white p-10">Access Denied</div>;
  }

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/admin/dashboard' },
    { icon: 'group', label: 'Members', href: '/admin/members' },
    { icon: 'payments', label: 'Payments', href: '#' },
    { icon: 'settings', label: 'Settings', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121215] border-r border-[#27272A] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#27272A]">
          <h1 className="font-montserrat text-xl font-black text-[#D0FF00] italic uppercase tracking-tighter">BEAST-FIT Admin</h1>
          <p className="font-mono text-[9px] text-[#A1A1AA] uppercase tracking-widest mt-1">Gym Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#D0FF00]/10 text-[#D0FF00]' : 'text-[#71717A] hover:bg-[#27272A] hover:text-white'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="font-inter font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#27272A]">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#FF2E54] hover:bg-[#FF2E54]/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-inter font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-[#27272A] bg-[#121215] flex justify-between items-center sticky top-0 z-50">
          <h1 className="font-montserrat text-lg font-black text-[#D0FF00] italic uppercase tracking-tighter">BEAST-FIT</h1>
          <button className="text-white"><span className="material-symbols-outlined">menu</span></button>
        </div>
        {children}
      </main>
    </div>
  );
}
