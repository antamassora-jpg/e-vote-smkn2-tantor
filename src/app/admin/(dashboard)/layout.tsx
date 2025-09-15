
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Vote,
  BarChart2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/voters', label: 'Data Pemilih', icon: Users },
  { href: '/admin/candidates', label: 'Kandidat', icon: UserCheck },
  { href: '/admin/results', label: 'Hasil', icon: BarChart2 },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const name = localStorage.getItem('adminName') || 'Administrator';
        if (isAdmin) {
          setAdminName(name);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
          router.replace('/admin');
        }
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminName');
    router.push('/');
  };
  
  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
         <div className="text-center">
              <p className="text-lg font-semibold">Memverifikasi sesi admin...</p>
              <Skeleton className="h-4 w-48 mt-2 mx-auto" />
          </div>
      </div>
    );
  }
  
  if (authStatus === 'unauthenticated') {
     return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p>Anda tidak diautentikasi. Mengarahkan...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 w-full">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Image src="https://iili.io/KT8dhns.png" alt="Logo" width={40} height={40} />
            <div className='flex flex-col'>
                <span className="font-bold text-lg text-red-500">KOMBEL Kenawa</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-5 ml-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-gray-900 py-2", 
                  pathname.startsWith(item.href) ? "text-gray-900 font-semibold border-b-2 border-red-500" : "text-gray-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className='text-right'>
                  <p className='font-semibold text-sm'>{adminName}</p>
                  <p className='text-xs text-gray-500'>Administrator</p>
              </div>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Keluar
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

    