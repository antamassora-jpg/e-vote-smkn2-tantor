

"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, X } from 'lucide-react';
import * as React from "react";
import type { Candidate, AdminUser, Voter, SystemSettings } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { newsArticles } from '@/lib/news-articles';
import Image from 'next/image';

// Context to share state between client components
const HomePageContext = React.createContext<{
    voters: Voter[];
    admins: AdminUser[];
    systemSettings: SystemSettings;
    isMulaiVotingOpen: boolean;
    setIsMulaiVotingOpen: (open: boolean) => void;
} | null>(null);

const useHomePageContext = () => {
    const context = React.useContext(HomePageContext);
    if (!context) {
        throw new Error("useHomePageContext must be used within a HomePageClientProvider");
    }
    return context;
};

// Main wrapper for client components that need shared state
export function HomePageClientProvider({ children, initialVoters, initialAdmins, systemSettings }: { children: React.ReactNode, initialVoters: Voter[], initialAdmins: AdminUser[], systemSettings: SystemSettings }) {
    const [isMulaiVotingOpen, setIsMulaiVotingOpen] = React.useState(false);
    
    const router = useRouter();
    React.useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [router]);

    return (
        <HomePageContext.Provider value={{ voters: initialVoters, admins: initialAdmins, isMulaiVotingOpen, setIsMulaiVotingOpen, systemSettings }}>
            {children}
            <MulaiVotingModal />
        </HomePageContext.Provider>
    );
}


function StudentLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { voters, systemSettings } = useHomePageContext();
  const router = useRouter();
  const { toast } = useToast();
  const [nis, setNis] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const isVotingActive = systemSettings.isVotingActive;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isVotingActive) {
        toast({ variant: 'destructive', title: 'Login Gagal', description: 'Sistem pemilihan sedang tidak aktif.' });
        setIsLoading(false);
        return;
    }

    try {
        const foundVoter = voters.find(v => v.nis.trim() === nis.trim());
        if (foundVoter) {
            if (foundVoter.password?.trim() === password.trim()) {
                if (foundVoter.hasVoted) {
                    toast({ variant: 'destructive', title: 'Anda Sudah Memilih', description: 'Anda tidak dapat login karena sudah memberikan suara.' });
                } else {
                    localStorage.setItem('studentData', JSON.stringify(foundVoter));
                    toast({ title: 'Login Berhasil', description: `Selamat datang, ${foundVoter.name}! Anda akan diarahkan...` });
                    onSuccess();
                    router.push('/vote');
                }
            } else {
                 toast({ variant: 'destructive', title: 'Login Gagal', description: 'Kata Sandi yang Anda masukkan salah.' });
            }
        } else {
             toast({ variant: 'destructive', title: 'Login Gagal', description: 'NIS tidak ditemukan.' });
        }
    } catch (error) {
       console.error("Login error:", error);
       toast({ variant: 'destructive', title: 'Terjadi Kesalahan', description: 'Gagal memuat data pemilih. Silakan coba lagi nanti.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2 text-left"><Label htmlFor="nis-modal-main" className="font-semibold">Nomor Induk Siswa (NIS)</Label><Input id="nis-modal-main" placeholder="Masukkan NIS Anda" required value={nis} onChange={(e) => setNis(e.target.value)} disabled={isLoading || !isVotingActive} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
        <div className="space-y-2 text-left"><Label htmlFor="password-modal-main">Kata Sandi</Label><Input id="password-modal-main" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || !isVotingActive} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-ring-blue-500 focus:border-transparent"/></div>
        <Button type="submit" className="w-full btn-gradient text-white py-6 rounded-lg font-semibold text-base" disabled={isLoading || !isVotingActive}>{isLoading ? 'Memverifikasi...' : <><ArrowRight className="mr-2 h-5 w-5" /> Masuk sebagai Siswa</>}</Button>
        {!isVotingActive && <p className="text-center text-sm text-red-600 mt-2">Sistem pemilihan sedang ditutup.</p>}
      </form>
      <div className="mt-6 text-center"><p className="text-sm text-gray-600">Butuh bantuan? <Link href="#" className="font-semibold text-blue-600 hover:text-blue-800">Hubungi Admin</Link></p></div>
    </>
  );
}

function MulaiVotingModal() {
    const { isMulaiVotingOpen, setIsMulaiVotingOpen } = useHomePageContext();
    return (
        <Dialog open={isMulaiVotingOpen} onOpenChange={setIsMulaiVotingOpen}>
            <DialogContent className="sm:max-w-sm p-0">
                <div className="relative bg-white rounded-2xl shadow-xl p-8">
                    <DialogHeader className="text-center mb-8">
                        <div className="inline-block p-3 gradient-bg rounded-xl mb-4 mx-auto"><GraduationCap className="h-8 w-8 text-white" /></div>
                        <DialogTitle className="text-2xl font-bold text-gray-800">Login Siswa</DialogTitle>
                        <DialogDescription className="text-gray-500 mt-1">Masuk untuk memberikan suara.</DialogDescription>
                    </DialogHeader>
                    <StudentLoginForm onSuccess={() => setIsMulaiVotingOpen(false)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}


export function StudentLoginModal() {
    const { setIsMulaiVotingOpen, systemSettings } = useHomePageContext();
    return (
        <Button onClick={() => setIsMulaiVotingOpen(true)} className="btn-gradient text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all" disabled={!systemSettings.isVotingActive}>
          <i className="fas fa-user-graduate mr-2"></i>
          Login Siswa
        </Button>
    )
}

export function AdminLoginModal() {
  const { admins } = useHomePageContext();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const foundAdmin = admins.find(admin => admin.username.trim().toLowerCase() === username.trim().toLowerCase());
      if (foundAdmin) {
        if (foundAdmin.status?.trim().toLowerCase() !== 'aktif') {
           toast({ variant: 'destructive', title: 'Login Gagal', description: 'Akun Anda tidak aktif. Silakan hubungi administrator.' });
        } else if (foundAdmin.password?.trim() === password.trim()) {
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminName', foundAdmin.name);
          toast({ title: 'Login Admin Berhasil', description: `Selamat datang, ${foundAdmin.name}. Anda akan diarahkan ke dashboard.` });
          setOpen(false);
          router.push('/admin/dashboard');
        } else {
           toast({ variant: 'destructive', title: 'Login Gagal', description: 'Password yang Anda masukkan salah.' });
        }
      } else {
        toast({ variant: 'destructive', title: 'Login Gagal', description: 'Username tidak ditemukan.' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ variant: 'destructive', title: 'Terjadi Kesalahan', description: 'Tidak dapat terhubung ke server. Silakan coba lagi nanti.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-admin text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"><i className="fas fa-user-shield mr-2"></i>Login Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-8">
        <DialogHeader className="text-center items-center">
            <div className="inline-block p-3 admin-gradient-bg rounded-xl mb-4"><i className="fas fa-user-shield text-2xl text-white"></i></div>
            <DialogTitle className="text-2xl font-bold text-gray-800">Login Admin</DialogTitle>
            <DialogDescription>Panel administrator sistem</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2"><Label htmlFor="username">Username Admin</Label><Input id="username" placeholder="Masukkan username" required value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"/></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"/></div>
            <Button type="submit" className="w-full btn-admin text-white py-3 rounded-lg font-semibold text-base" disabled={isLoading}>{isLoading ? 'Memverifikasi...' : <><ArrowRight className="mr-2 h-5 w-5" /> Masuk sebagai Admin</>}</Button>
        </form>
        <div className="mt-4 text-center"><p className="text-sm text-gray-600">Butuh bantuan? <Link href="#" className="font-semibold text-blue-600 hover:text-blue-800">Hubungi Admin</Link></p></div>
      </DialogContent>
    </Dialog>
  );
}

export function MulaiVotingButton() {
    const { setIsMulaiVotingOpen, systemSettings } = useHomePageContext();
    
    if (!systemSettings.isVotingActive) {
        return (
             <Button size="lg" className="bg-yellow-500 text-white px-8 py-3 rounded-full font-semibold text-base transition-all shadow-lg" disabled>
                <i className="fas fa-lock mr-2"></i> Voting Ditutup
            </Button>
        )
    }

    return (
        <Button size="lg" className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-base hover:bg-gray-100 transition-all shadow-lg" onClick={() => setIsMulaiVotingOpen(true)}>
            <i className="fas fa-vote-yea mr-2"></i> Mulai Voting
        </Button>
    )
}

export function NewsCarousel() {
    const plugin = React.useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true })
    )
  
    return (
      <Carousel plugins={[plugin.current]} className="w-full" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset} opts={{ loop: true }}>
        <CarouselContent>
          {newsArticles.map((article) => (
            <CarouselItem key={article.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                   <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <div className="relative h-48 w-full">
                        <Image src={article.imageUrl} alt={article.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint={article.imageHint} />
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-blue-600 font-semibold mb-2">{article.source}</p>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 h-20 overflow-hidden">{article.title}</h3>
                        <p className="text-sm text-gray-600 h-24 overflow-hidden">{article.snippet}</p>
                         <div className="mt-4 text-right">
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Baca Selengkapnya &rarr;</span>
                          </div>
                      </div>
                   </a>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2" />
      </Carousel>
    )
}

export function CandidateInfoCarousel({ candidates }: { candidates: Candidate[] }) {
    if (!candidates || candidates.length === 0) {
        return <div className="text-center py-4"><p className="text-sm text-yellow-800">Belum ada kandidat terdaftar.</p></div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <h4 className="font-bold text-sm mb-2 text-yellow-900">DAFTAR KANDIDAT</h4>
            <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent className="-ml-4">
                    {candidates.map((candidate) => (
                        <CarouselItem key={candidate.id} className="pl-4">
                            <div className="p-1">
                                <div className="flex items-center p-4 bg-white/30 rounded-lg backdrop-blur-sm">
                                    <Avatar className="h-16 w-16 mr-4">
                                      <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                      <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-bold text-base text-yellow-900 leading-tight">{candidate.name}</p>
                                        <p className="text-xs text-yellow-800 italic">"{candidate.slogan}"</p>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}


