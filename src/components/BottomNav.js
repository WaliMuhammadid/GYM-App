'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: 'home', label: 'Home', href: '/dashboard' },
    { icon: 'fitness_center', label: 'Workouts', href: '/workouts' },
    { icon: 'smart_toy', label: 'Coach', href: '/coach' },
    { icon: 'restaurant', label: 'Nutrition', href: '/nutrition' },
    { icon: 'person', label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glassmorphism border-t border-[#27272A] pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-center w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center p-2">
              <div className={`flex flex-col items-center transition-colors ${isActive ? 'text-[#D0FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>
                <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
