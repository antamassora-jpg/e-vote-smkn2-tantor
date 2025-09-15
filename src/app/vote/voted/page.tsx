"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, PieChart as PieChartIcon, Home } from "lucide-react";
import Link from "next/link";
import { getCandidates, getVoters } from "@/lib/data";
import type { Candidate, Voter } from "@/lib/types";
import { ResultsChart } from "./results-chart";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function VotedPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // No need to set loading to true, handled by initial state
                const [candidatesData, votersData] = await Promise.all([
                    getCandidates(),
                    getVoters(),
                ]);
                setCandidates(candidatesData);
                setTotalVotes(votersData.filter(v => v.hasVoted).length);
            } catch (error) {
                console.error("Failed to fetch results data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
        
        const intervalId = setInterval(fetchData, 30000); // Refresh data every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center text-center py-20">
                <Skeleton className="w-24 h-24 rounded-full mb-6" />
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-8" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex flex-col items-center justify-center text-center py-20">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Terima Kasih Telah Memilih!
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8">
                Suara Anda telah berhasil direkam. Partisipasi Anda sangat berarti untuk masa depan OSIS yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="btn-gradient text-white">
                            <PieChartIcon className="mr-2 h-4 w-4" /> Lihat Hasil Real-time
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl modal-advanced p-0">
                         <div className="quantum-effect rounded-lg">
                            <DialogHeader className="p-6">
                                <DialogTitle className="text-2xl font-bold text-white">Perolehan Suara Sementara</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Hasil ini diperbarui secara real-time. Arahkan mouse ke grafik untuk detail.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="p-4">
                                <ResultsChart candidates={candidates} totalVotes={totalVotes} />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button asChild variant="outline">
                    <Link href="/">
                       <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
                    </Link>
                </Button>
            </div>
             <p className="text-sm text-gray-500 mt-8 max-w-md">
                Catatan: Anda hanya bisa menggunakan hak suara Anda satu kali. Terima kasih atas kejujuran dan partisipasi Anda dalam proses demokrasi ini.
            </p>
        </div>
    );
}
