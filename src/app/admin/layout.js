'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#144E36] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Basic role check
  if (session && session.user.role !== 'admin') {
    return <div className="min-h-screen bg-[#F4F5F6] text-[#111827] p-10 font-inter font-bold">Access Denied</div>;
  }

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/admin/dashboard' },
    { icon: 'group', label: 'Members', href: '/admin/members', badge: 'Active' },
    { icon: 'calendar_month', label: 'Calendar', href: '#' },
    { icon: 'monitoring', label: 'Analytics', href: '#' },
    { icon: 'diversity_3', label: 'Trainers', href: '#' },
  ];

  const generalItems = [
    { icon: 'settings', label: 'Settings', href: '#' },
    { icon: 'help_outline', label: 'Help & Support', href: '#' },
  ];

  const adminName = session?.user?.name || 'Totok Admin';
  const adminEmail = session?.user?.email || 'admin@beastfit.com';

  return (
    <div className="min-h-screen bg-[#F4F5F6] p-3 md:p-6 flex justify-center text-[#111827] font-inter antialiased">
      {/* Outer Rounded Container matching Donezo canvas */}
      <div className="w-full max-w-[1550px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[28px] md:rounded-[36px] shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[94vh]">
        
        {/* Modern Donezo Sidebar */}
        <aside className={`w-64 bg-[#FAFAFA] border-r border-[#E5E7EB] flex flex-col justify-between p-6 shrink-0 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#144E36] text-[#D0FF00] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  fitness_center
                </span>
              </div>
              <div>
                <span className="font-montserrat font-black text-xl text-[#111827] tracking-tight flex items-center gap-1">
                  BeastFit<span className="w-2 h-2 rounded-full bg-[#144E36] inline-block"></span>
                </span>
              </div>
            </div>

            {/* Menu Section */}
            <div className="mb-6">
              <p className="font-mono text-[11px] text-[#9CA3AF] tracking-wider uppercase font-bold mb-3 px-3">
                MENU
              </p>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#144E36] text-white shadow-sm font-semibold'
                          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="bg-[#144E36]/10 text-[#144E36] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* General Section */}
            <div>
              <p className="font-mono text-[11px] text-[#9CA3AF] tracking-wider uppercase font-bold mb-3 px-3">
                GENERAL
              </p>
              <nav className="space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2]/50 transition-colors text-left mt-1"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Download App Promo Card (Matches Donezo screenshot) */}
          <div className="mt-8 bg-gradient-to-b from-[#0F3927] to-[#0A261A] text-white p-4 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#256E4E]/30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[#D0FF00] text-lg">apk_install</span>
            </div>
            <h4 className="font-montserrat font-bold text-sm text-white leading-tight">
              Download our Mobile App
            </h4>
            <p className="text-[11px] text-[#9CA3AF] mt-1 mb-3">
              Access gym and member tracking on Android &amp; iOS.
            </p>
            <a
              href="https://expo.dev/accounts/waliubits-team/projects/gym/builds"
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-[#144E36] hover:bg-[#1D6347] border border-[#2B7A57] text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
            >
              Download APK
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
          {/* Top Navigation Header (Matches Donezo) */}
          <header className="px-6 py-4 border-b border-[#F0F2F4] flex items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-30">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#E5E7EB] text-[#4B5563]"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Search Input with Shortcut Key */}
            <div className="flex-1 max-w-md relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search athletes, plans, transactions..."
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl pl-10 pr-12 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#144E36] focus:outline-none transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#E5E7EB]/80 text-[#6B7280] text-[11px] font-mono px-1.5 py-0.5 rounded-md font-bold">
                ⌘F
              </span>
            </div>

            {/* Header Right Actions & Profile Pill */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="w-10 h-10 rounded-full border border-[#E5E7EB] hover:bg-[#F8F9FA] flex items-center justify-center text-[#4B5563] transition-colors relative">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-[#E5E7EB] hover:bg-[#F8F9FA] flex items-center justify-center text-[#4B5563] transition-colors relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white"></span>
              </button>

              {/* Admin Profile Pill (Totok Michael style) */}
              <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-[#E5E7EB]">
                <div className="w-10 h-10 rounded-full bg-[#144E36] text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-[#111827] leading-none">{adminName}</p>
                  <p className="text-[11px] text-[#6B7280] mt-1 leading-none truncate max-w-[140px]">{adminEmail}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FFFFFF]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
