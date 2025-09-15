"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shield, LineChart, Smartphone, Trophy, Info, Users, UserCheck, List, BarChart2 as BarChartIcon, ArrowRight, GraduationCap, X, Vote, CheckCircle, TrendingUp, AlertTriangle, CalendarDays, QrCode } from 'lucide-react';
import type { Candidate, SystemSettings, Voter, AdminUser } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HomePageClientProvider, AdminLoginModal, StudentLoginModal, MulaiVotingButton, NewsCarousel, CandidateInfoCarousel } from './home-page-client';
import { HomeCharts } from './home-page-charts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";
import { cn } from '@/lib/utils';
import { getCandidates, getAdminUsers, getVoters, getSystemSettings } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode, value: string, label: string, color: 'blue' | 'green' | 'purple' | 'orange' }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className={`p-4 rounded-xl flex items-center space-x-4 ${colors[color]}`}>
            <div className="p-3 bg-white rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-medium">{label}</p>
            </div>
        </div>
    );
};

function TimelineItem({ date, title, details, isHighlighted }: { date: string; title: string; details?: string[], isHighlighted?: boolean}) {
    const highlightClass = isHighlighted ? 'bg-blue-50 border-l-blue-500' : 'bg-white';
    return (
        <div className="relative pl-8 mb-8 break-inside-avoid">
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full gradient-bg"></div>
            <div className="absolute left-[7px] top-4 w-0.5 h-full bg-gray-200"></div>
            <div className={`p-6 rounded-xl shadow-lg ${highlightClass} border border-gray-100`}>
                <p className={`text-sm font-semibold mb-1 ${isHighlighted ? 'text-blue-600' : 'text-gray-500'}`}>{date}</p>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                {details && (
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {details.map((detail, i) => <li key={i}>{detail}</li>)}
                    </ul>
                )}
            </div>
        </div>
    );
}

function CandidateShowcaseCard({ candidate }: { candidate: Candidate }) {
    const MAX_MISI_ITEMS = 3;
    const parsePlatform = (platform: string) => {
        if (!platform) return { visi: "Visi tidak tersedia.", misi: [] };
        const visiMatch = platform.match(/Visi:(.*?)(?=Misi:|$)/s);
        const misiMatch = platform.match(/Misi:(.*)/s);
        const visi = visiMatch ? visiMatch[1].trim() : "Visi tidak tersedia.";
        let misi: string[] = [];
        if (misiMatch) {
            misi = misiMatch[1].trim().split('\n').map(item => item.replace(/^-/, '').trim()).filter(Boolean);
        }
        return { visi, misi };
    };

    const { visi, misi } = parsePlatform(candidate.platform);
    const displayedMisi = misi.slice(0, MAX_MISI_ITEMS);

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border border-gray-100">
             <div className="p-6 text-center">
                <Avatar className="w-20 h-20 text-3xl mx-auto mb-4 gradient-bg text-white shadow-md">
                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                    <AvatarFallback className="bg-transparent">{getInitials(candidate.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                <p className="text-sm text-gray-500 italic mt-1">"{candidate.slogan}"</p>
            </div>
            
            <div className="p-6 flex-grow text-sm">
                 <div className="space-y-4 text-gray-700">
                    <div>
                        <h4 className="font-semibold text-blue-600 mb-1">Visi:</h4>
                        <p className="text-gray-600">{visi}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-blue-600 mb-1">Misi:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                           {displayedMisi.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                         {misi.length > MAX_MISI_ITEMS && (
                             <Dialog>
                                <DialogTrigger asChild><button className="text-blue-500 text-xs hover:underline mt-1">...dan lainnya</button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Visi & Misi Lengkap: {candidate.name}</DialogTitle></DialogHeader>
                                     <div className="py-4 space-y-4 text-sm">
                                        <div><h4 className="font-bold text-base text-blue-600">Visi</h4><p>{visi}</p></div>
                                        <div><h4 className="font-bold text-base text-blue-600">Misi</h4><ul className="list-disc list-inside space-y-1">{misi.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                         )}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t mt-auto">
                <Dialog>
                    <DialogTrigger asChild><Button variant="outline" className="w-full btn-gradient text-white font-semibold"><Info className="mr-2 h-4 w-4" /> Lihat Detail</Button></DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle className="text-2xl">{candidate.name}</DialogTitle>
                            <DialogDescription className="italic">"{candidate.slogan}"</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div><h4 className="font-bold text-lg text-blue-600">Visi</h4><p>{visi}</p></div>
                            <div><h4 className="font-bold text-lg text-blue-600">Misi</h4><ul className="list-disc list-inside space-y-1">{misi.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

function HomePageContent({ data }: { data: { candidates: Candidate[]; voters: Voter[]; admins: AdminUser[]; settings: SystemSettings; }}) {
  const { candidates, voters, admins, settings } = data;
  const totalVoters = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const participation = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;
  
  const stats = {
    totalVoters: totalVoters,
    votedCount: votedCount,
    candidateCount: candidates.length,
    participation: `${participation.toFixed(1)}%`
  };

  const now = new Date();
  const participationData = Array.from({length: 8}, (_, i) => {
      const hour = 8 + i;
      const time = `${String(hour).padStart(2, '0')}:00`;
      let value = 0;
      if (now.getHours() >= hour) {
          const ratio = (i + 1) / 8;
          const simulatedVotedCount = Math.floor(votedCount * ratio * (Math.random() * 0.4 + 0.8));
          value = Math.min(simulatedVotedCount, totalVoters);
      }
      return { time, value };
  });

  const recentVoters = voters
      .filter(v => v.hasVoted && v.voteTime)
      .sort((a, b) => new Date(b.voteTime!).getTime() - new Date(a.voteTime!).getTime())
      .slice(0, 2);

  const recentActivities = recentVoters.map((v) => {
      const timeDiff = Math.round((new Date().getTime() - new Date(v.voteTime!).getTime()) / 60000); // in minutes
      return {
          icon: 'UserCheck',
          text: `Siswa dari kelas ${v.class} baru saja memberikan suara`,
          time: `${Math.max(1, timeDiff)} menit yang lalu`,
          color: "text-green-500"
      };
  });

  if (recentActivities.length < 3) {
    recentActivities.push({
        icon: 'TrendingUp',
        text: `Tingkat partisipasi mencapai ${participation.toFixed(1)}%`,
        time: "Baru saja diperbarui",
        color: "text-blue-500"
    });
  }

  return (
    <div className='bg-gray-100'>
      <HomePageClientProvider initialVoters={voters} initialAdmins={admins} systemSettings={settings}>
          <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
              <div className="container mx-auto px-6">
              <div className="flex justify-between items-center py-3">
                  <Link href="/" className="flex items-center space-x-3">
                  <Image src="https://iili.io/KT8dhns.png" alt="Logo" width={40} height={40} />
                  <div>
                      <h1 className="text-xl font-bold gradient-text">KOMBEL Kenawa</h1>
                      <p className="text-xs text-gray-500 -mt-1">Sistem Pemilihan OSIS SERENTAK Sulawesi Selatan</p>
                  </div>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                      <StudentLoginModal />
                      <AdminLoginModal />
                  </div>
              </div>
              </div>
          </nav>

          {/* Hero Section */}
          <section id="hero" className="gradient-bg text-white">
            <div className="container mx-auto px-6 pt-16 pb-20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Column */}
                  <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                      Pemilihan OSIS
                      <span className="block text-yellow-300">SERENTAK 2025/2026</span>
                    </h1>
                    <p className="text-lg text-blue-100 max-w-md mx-auto md:mx-0 mb-8">
                      Sistem Pemiihan OSIS Digital SMKN 2 Tana Toraja
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <MulaiVotingButton />
                        <Button asChild size="lg" variant="outline" className="bg-white/20 text-white px-8 py-3 rounded-full font-semibold text-base hover:bg-white/30 transition-all backdrop-blur-sm">
                            <Link href="#candidates">
                                <Users className="mr-2" />
                                Lihat Kandidat
                            </Link>
                        </Button>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="flex justify-center">
                    <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl text-center border border-white/30 max-w-sm w-full">
                      <div className="mb-4">
                        <Image
                            src="https://iili.io/KIqFNet.png"
                            alt="Logo SMKN 2 Tana Toraja"
                            width={100}
                            height={100}
                            className="mx-auto"
                          />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">SMKN 2 Tana Toraja</h3>
                      <p className="text-blue-100">
                        Sistem Pemillihan Osis Serentak
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </section>
          
          {/* Statistics Section */}
          <section className="py-12 bg-gray-100 -mt-10 relative z-10">
            <div className="container mx-auto px-6">
                <div className="space-y-10">
                    <Card className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Statistik Pemilihan Real-time</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={<Users />} value={stats.totalVoters.toLocaleString()} label="Total Pemilih" color="blue" />
                            <StatCard icon={<UserCheck />} value={stats.votedCount.toLocaleString()} label="Suara Masuk" color="green" />
                            <StatCard icon={<List />} value={stats.candidateCount.toString()} label="Kandidat" color="purple" />
                            <StatCard icon={<BarChartIcon />} value={stats.participation} label="Partisipasi" color="orange" />
                        </div>
                    </Card>

                    <HomeCharts participationData={participationData} recentActivities={recentActivities} />
                    
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 p-6">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            <div className="flex-grow">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <AlertTitle className="font-bold">Penting untuk Diperhatikan</AlertTitle>
                                        <AlertDescription>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Setiap siswa hanya dapat memberikan suara satu kali.</li>
                                                <li>Pilihan yang sudah dikirim tidak dapat diubah.</li>
                                                <li>Masa kampanye berlangsung 20–26 September 2025.</li>
                                                <li>Masa tenang sebelum pemilihan: 27–28 September 2025.</li>
                                                <li>Pastikan pilihan Anda sudah tepat sebelum mengirim.</li>
                                            </ul>
                                        </AlertDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="md:border-l border-yellow-300 md:pl-6 flex-shrink-0">
                                <CandidateInfoCarousel candidates={candidates} />
                            </div>
                        </div>
                    </Alert>
                </div>
            </div>
          </section>

          {/* Candidates Section */}
          <section id="candidates" className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold gradient-text mb-4">Kandidat Osis SMKN 2 Tana Toraja Tahun 2025/2026</h2>
                <p className="text-xl text-gray-600">Kenali visi dan misi para calon ketua osis</p>
              </div>
              {candidates.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {candidates.map((candidate) => (
                    <CandidateShowcaseCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                  <p>Belum ada data kandidat yang ditambahkan oleh admin.</p>
                  <p className="text-sm mt-2">Silakan hubungi panitia pemilihan.</p>
                </div>
              )}
            </div>
          </section>
          
          {/* News Carousel Section */}
          <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold gradient-text mb-4">Sorotan Berita Pemilihan Serentak</h2>
                        <p className="text-xl text-gray-600">Liputan media terkini seputar Pemilihan OSIS di Sulawesi Selatan</p>
                    </div>
                    <NewsCarousel />
                </div>
            </section>

          {/* Timeline Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold gradient-text mb-4">TAHAPAN PEMILIHAN KETUA OSIS & WAKIL KETUA OSIS SERENTAK SMA/SMK SE-SULAWESI SELATAN TAHUN 2025</h2>
                        <p className="text-xl text-gray-600">Jadwal lengkap proses pemilihan OSIS serentak</p>
                    </div>
                    
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                            <div className="flex flex-col">
                                <TimelineItem date="1–8 September 2025" title="Perencanaan dan Persiapan" details={[
                                    "Perencanaan, Program, dan Sosialisasi Pemilihan Ketua OSIS & Wakil Ketua OSIS",
                                    "Pembentukan Panitia Pemilihan OSIS",
                                    "Pembentukan Panitia Pengawas Pemilihan OSIS",
                                    "Pembentukan Panitia Kehormatan Pemilihan OSIS",
                                ]} />
                                <TimelineItem date="9 September 2025" title="Penetapan Syarat Calon" details={["Penetapan syarat calon Ketua OSIS & Wakil Ketua OSIS periode 2025–2026 oleh pihak sekolah"]} />
                                <TimelineItem date="10–11 September 2025" title="Pemutakhiran Data Pemilih" details={[
                                    "Pemutakhiran data pemilih dan penetapan daftar pemilih tetap",
                                    "Rekapitulasi pemutakhiran pemilih tingkat kelas",
                                    "Rekapitulasi pemutakhiran pemilih tingkat sekolah"
                                ]} />
                                <TimelineItem date="12 September 2025" title="Pendaftaran Calon" details={["Pendaftaran bakal calon Ketua OSIS & Wakil Ketua OSIS"]} />
                                <TimelineItem date="13–14 September 2025" title="Verifikasi dan Seleksi" details={[
                                    "Pemeriksaan dan verifikasi administrasi",
                                    "Tes wawancara"
                                ]} />
                                <TimelineItem date="29–30 September 2025" title="Penyelesaian Sengketa dan Penetapan Hasil" details={[
                                    "Pengajuan dan penyelesaian sengketa (jika ada laporan Panwaslo)",
                                    "Penetapan hasil pemilihan Ketua & Wakil Ketua OSIS",
                                ]} />
                            </div>
                            <div className="flex flex-col">
                                <TimelineItem date="15–16 September 2025" title="Penetapan Calon dan Persiapan Kampanye" details={[
                                    "Penetapan calon Ketua & Wakil Ketua OSIS serta pengundian nomor urut",
                                    "Pendaftaran tim kampanye",
                                    "Pelaporan dana kampanye"
                                ]} />
                                <TimelineItem date="16–19 September 2025" title="Sosialisasi Awal" details={["Sosialisasi dan pembagian surat pemberitahuan memilih"]} />
                                <TimelineItem date="20–26 September 2025" title="Masa Kampanye" isHighlighted={true} details={[
                                    "Penyebaran bahan kampanye & alat peraga kampanye",
                                    "Pembuatan dan penyampaian video visi dan misi calon Ketua & Wakil Ketua OSIS serta upload video visi-misi online",
                                    "Sosialisasi visi dan misi calon",
                                    "Orasi (rapat umum) dan debat terbuka calon Ketua & Wakil Ketua OSIS"
                                ]} />
                                <TimelineItem date="27–28 September 2025" title="Masa Tenang" />
                                <TimelineItem date="29 September 2025" title="Pemungutan Suara" isHighlighted={true} details={["Pemungutan, penghitungan, dan rekapitulasi suara"]} />
                                <TimelineItem date="(Menyesuaikan)" title="Penetapan Pemenang" details={["Penetapan Ketua OSIS & Wakil Ketua OSIS terpilih"]} />
                            </div>
                        </div>
                    </div>
                </div>
          </section>

          {/* Footer */}
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
        </HomePageClientProvider>
    </div>
  );
}

// Main component for the homepage
export default function HomePage() {
  const [data, setData] = useState<{
    candidates: Candidate[];
    voters: Voter[];
    admins: AdminUser[];
    settings: SystemSettings;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [candidates, voters, admins, settings] = await Promise.all([
          getCandidates(),
          getVoters(),
          getAdminUsers(),
          getSystemSettings()
        ]);
        setData({ candidates, voters, admins, settings });
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Gagal memuat data dari server. Silakan coba lagi nanti.");
      }
    }

    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Refresh data every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  if (error) {
     return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-center p-4">
        <div>
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-700">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-6">
                Coba Lagi
            </Button>
        </div>
      </div>
    );
  }

  if (!data) {
     return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-center">
        <div>
            <Image src="https://iili.io/KT8dhns.png" alt="Logo" width={80} height={80} className="mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Memuat data aplikasi...</p>
            <div className="mt-4 flex justify-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
      </div>
    );
  }

  return <HomePageContent data={data} />;
}
