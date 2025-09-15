"use client";

import { useEffect, useState } from 'react';
import { getCandidates, getVoters, getSystemSettings } from '@/lib/data';
import type { Candidate, Voter, SystemSettings } from '@/lib/types';
import { StudentInfoCard } from './_components/student-info-card';
import { CandidateCard } from './_components/candidate-card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, User, List, CheckCircle, Shield, Users, UserCheck, BarChart2, TrendingUp, Activity, AlertTriangle, CalendarDays } from "lucide-react";
import Image from 'next/image';
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

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // No need to set loading to true, it's the initial state
        const [candidatesData, votersData, settingsData] = await Promise.all([
          getCandidates(),
          getVoters(),
          getSystemSettings(),
        ]);
        setCandidates(candidatesData);
        setVoters(votersData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch voting data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Refresh data every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading || !settings) {
    return (
        <div className="container mx-auto max-w-7xl space-y-10 p-4 md:p-8">
            <div className="text-center space-y-4">
                <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }
  
  const totalVoters = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const participation = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) + '%' : '0%';

  const startDate = new Date(settings.startDate);
  const startDay = startDate.getDate();
  const startMonth = startDate.toLocaleString('id-ID', { month: 'long' });
  const startYear = startDate.getFullYear();
  
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="space-y-10">
        <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-primary/10 rounded-full">
                <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Selamat Datang!</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Anda telah berhasil masuk ke sistem pemilihan OSIS. Silakan pilih kandidat terbaik Anda.
            </p>
        </div>

        <StudentInfoCard />

        {!settings.isVotingActive && (
             <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 p-6">
                 <AlertTriangle className="h-5 w-5 text-red-600" />
                 <AlertTitle className="font-bold">Sistem Pemilihan Ditutup</AlertTitle>
                <AlertDescription>
                    Administrator telah menutup sesi pemilihan. Anda tidak dapat memberikan suara saat ini.
                </AlertDescription>
            </Alert>
        )}
        
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-grow">
                    <AlertTitle className="font-bold">Petunjuk Voting</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Klik pada kandidat yang ingin Anda pilih.</li>
                            <li>Pelajari profil kandidat dengan mengklik "Lihat Detail".</li>
                            <li>Setelah yakin, klik tombol "Pilih Kandidat Ini" untuk mengonfirmasi.</li>
                            <li className="font-semibold">Pilihan Anda tidak dapat diubah setelah dikonfirmasi.</li>
                        </ul>
                    </AlertDescription>
                </div>
                    <div className="md:border-l border-blue-300 md:pl-6 flex-shrink-0">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-center">
                            <p className="font-bold text-sm">HARI PEMILIHAN</p>
                            <div className="flex items-center gap-2 mt-1">
                                <CalendarDays className="h-6 w-6"/>
                                <span className="text-2xl font-bold">{startDay}</span>
                                <div className="text-left">
                                    <p className="text-sm font-semibold leading-tight">{startMonth}</p>
                                    <p className="text-xs leading-tight">{startYear}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                                <p className="font-bold text-sm mb-1">PANDUAN</p>
                                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.youtube.com/watch?v=dQw4w9WgXcQ" alt="QR Code Panduan" width={80} height={80} />
                        </div>
                    </div>
                </div>
            </div>
        </Alert>

        <h2 className="text-3xl font-bold text-center text-gray-800 pt-6">
            Pilih Kandidat OSIS 2025
        </h2>

        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-lg">Belum ada kandidat yang terdaftar.</p>
            <p>Silakan hubungi administrator untuk menambahkan data kandidat.</p>
          </div>
        )}

        <div className="space-y-10 pt-10">
            {/* Real-time stats */}
            <Card className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Statistik Pemilihan Real-time</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Users />} value={totalVoters.toLocaleString()} label="Total Pemilih" color="blue" />
                    <StatCard icon={<UserCheck />} value={votedCount.toLocaleString()} label="Suara Masuk" color="green" />
                    <StatCard icon={<List />} value={candidates.length.toString()} label="Kandidat" color="purple" />
                    <StatCard icon={<BarChart2 />} value={participation} label="Partisipasi" color="orange" />
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
}
