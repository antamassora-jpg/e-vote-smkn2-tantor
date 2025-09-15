
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Voter } from '@/lib/types';
import { LogOut, Vote } from 'lucide-react';
import Image from 'next/image';

export default function VoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Voter | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const studentData = localStorage.getItem('studentData');
      if (!studentData) {
        router.replace('/');
        return;
      }
      const parsedData: Voter = JSON.parse(studentData);
      setStudent(parsedData);

      // Redirect if the voter has already voted and is not on the 'voted' page.
      if (parsedData.hasVoted && pathname !== '/vote/voted') {
          router.replace('/vote/voted');
      }
      // Redirect if the voter has NOT voted and is on the 'voted' page.
      if (!parsedData.hasVoted && pathname === '/vote/voted') {
        router.replace('/vote');
      }


    } catch (error) {
      console.error('Failed to parse student data', error);
      localStorage.removeItem('studentData');
      router.replace('/');
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    router.push('/');
  };

  if (!isClient || !student) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Memuat data pemilih...</p>
      </div>
    );
  }
  
  if (student.hasVoted && pathname !== '/vote/voted') {
    return (
       <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Mengarahkan ke halaman hasil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                 <Link href="/" className="flex items-center space-x-3">
                    <Image src="https://iili.io/KT8dhns.png" alt="Logo" width={48} height={48} />
                    <div>
                        <h1 className="text-xl font-bold gradient-text">KOMBEL Kenawa</h1>
                        <p className="text-xs text-gray-500">Sistem Pemilihan Osis SMKN 2 Tana Toraja</p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Siswa</p>
                    </div>
                    <Button onClick={handleLogout} variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </div>
        </div>
      </header>
      <main className="p-4 md:p-8 flex-grow">{children}</main>
       <footer className="gradient-bg text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="md:justify-self-start">
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                            <Image src="https://iili.io/KT8dhns.png" alt="Logo" width={40} height={40} />
                            <h3 className="text-xl font-bold">KOMBEL Kenawa</h3>
                        </div>
                        <p className="text-gray-300">Sistem Pemilihan OSIS SERENTAK Sulawesi Selatan.</p>
                    </div>
                    
                     <div className="md:justify-self-center">
                        <h4 className="text-lg font-bold mb-4">Kontak</h4>
                        <div className="space-y-2 text-gray-300">
                            <p><i className="fas fa-envelope mr-2"></i> smkn2tantor@gmail.com</p>
                            <p><i className="fas fa-phone mr-2"></i> 0852-5567-2747</p>
                            <p><i className="fas fa-map-marker-alt mr-2"></i> Jl. Poros Mebali Buntu, Kel. Benteng Ambeso, Kec. Gandangbatu Sillanan, Kab. Tana Toraja, Prov. Sulawesi Selatan</p>
                        </div>
                    </div>
                    
                    <div className="md:justify-self-end">
                        <h4 className="text-lg font-bold mb-4">Bantuan</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Panduan Voting</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Hubungi Support</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 KOMBEL Kenawa. Semua hak dilindungi.</p>
                </div>
            </div>
        </footer>
    </div>
  );
}
    

    