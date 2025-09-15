"use client";

import { useEffect, useState } from 'react';
import { getCandidates, getVoters } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, Users, Percent, Trophy } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { ExportResultsButton } from './export-results-button';
import type { Candidate } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
    totalVoters: number;
    votedCount: number;
    participation: number;
}

export default function ResultsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // No need to set loading to true here, it's the initial state
                const [candidatesData, votersData] = await Promise.all([
                    getCandidates(),
                    getVoters(),
                ]);

                const totalVoters = votersData.length;
                const votedCount = votersData.filter(v => v.hasVoted).length;
                const participation = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;
                
                setCandidates(candidatesData);
                setStats({ totalVoters, votedCount, participation });
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

    if (isLoading || !stats) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    const totalVotes = stats.votedCount;
    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-red-500">Hasil Pemilihan Real-time</h1>
                    <p className="text-gray-500">Panel hasil akhir dan statistik pemilihan OSIS SERENTAK</p>
                </div>
                <ExportResultsButton candidates={sortedCandidates} totalVotes={totalVotes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {sortedCandidates.map((candidate, index) => {
                        const votePercentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                        return (
                            <Card key={candidate.id} className="w-full">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                        <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-lg">{candidate.name}</p>
                                            {index === 0 && totalVotes > 0 && candidate.votes > 0 && (
                                                 <div className="flex items-center text-yellow-500 font-semibold text-sm">
                                                    <Trophy className="w-4 h-4 mr-1" />
                                                    <span>Unggul</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 italic mb-2">"{candidate.slogan}"</p>
                                        <Progress value={votePercentage} className="h-2" />
                                    </div>
                                    <div className="text-right pl-4 border-l">
                                        <p className="text-2xl font-bold text-red-500">{votePercentage.toFixed(1)}%</p>
                                        <p className="text-sm text-gray-600">{candidate.votes.toLocaleString()} Suara</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                     {candidates.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <p>Belum ada data kandidat.</p>
                                <p>Silakan tambahkan kandidat di halaman Manajemen Kandidat.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Voting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="text-gray-500" />
                                    <span className="font-medium">Total Pemilih</span>
                                </div>
                                <span className="font-bold text-lg">{stats.totalVoters.toLocaleString()}</span>
                            </div>
                             <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="text-gray-500" />
                                    <span className="font-medium">Suara Masuk</span>
                                </div>
                                <span className="font-bold text-lg">{stats.votedCount.toLocaleString()}</span>
                            </div>
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center gap-3">
                                        <Percent className="text-gray-500" />
                                        <span className="font-medium">Tingkat Partisipasi</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.participation.toFixed(1)}%</span>
                                </div>
                                <Progress value={stats.participation} className="h-3" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
