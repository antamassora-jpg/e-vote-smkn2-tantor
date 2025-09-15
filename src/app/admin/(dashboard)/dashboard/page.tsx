"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, UserX, Percent, Settings, LayoutDashboard, BarChart2, User } from "lucide-react";
import { getCandidates, getVoters } from '@/lib/data';
import { RealtimeChart } from "./realtime-chart";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Candidate, Voter, VoteCount } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
    totalVoters: number;
    votedCount: number;
    notVotedCount: number;
    participation: string;
}

interface ChartData {
    votesByCandidate: {
        candidateId: string;
        candidateName: string;
        totalVotes: number;
        classData: { name: string; votes: number }[];
    }[];
    totalVoteCounts: VoteCount[];
}

const dashboardTabs = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, active: true },
    { href: "/admin/voters", label: "Data Pemilih", icon: Users, active: false },
    { href: "/admin/candidates", label: "Kandidat", icon: User, active: false },
    { href: "/admin/results", label: "Hasil Real-time", icon: BarChart2, active: false },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings, active: false },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Don't set loading to true here, it's handled by initial state
                const voters = await getVoters();
                const candidates = await getCandidates();

                // Calculate stats
                const totalVoters = voters.length;
                const votedCount = voters.filter(v => v.hasVoted).length;
                const notVotedCount = totalVoters - votedCount;
                const participation = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;
                setStats({
                    totalVoters,
                    votedCount,
                    notVotedCount,
                    participation: `${participation.toFixed(1)}%`,
                });

                // Calculate chart data
                const votesByCandidate = candidates.map(candidate => {
                    const votesFromClasses: { [key: string]: number } = {};
                    voters.forEach(voter => {
                        if (voter.votedFor === candidate.id) {
                            votesFromClasses[voter.class] = (votesFromClasses[voter.class] || 0) + 1;
                        }
                    });
                    const classVoteData = Object.keys(votesFromClasses).map(className => ({
                        name: className,
                        votes: votesFromClasses[className]
                    })).sort((a, b) => b.votes - a.votes);

                    return {
                        candidateId: candidate.id,
                        candidateName: candidate.name,
                        totalVotes: candidate.votes,
                        classData: classVoteData,
                    };
                });
                const totalVoteCounts = candidates.map(c => ({
                    name: c.name,
                    votes: c.votes
                }));
                setChartData({ votesByCandidate, totalVoteCounts });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchData();
        const intervalId = setInterval(fetchData, 30000); // Refresh data every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    if (isLoading || !stats || !chartData) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-red-500">Dashboard Admin</h1>
                <p className="text-gray-500">Panel kontrol sistem pemilihan OSIS SERENTAK</p>
            </div>

            <div className="flex items-center space-x-2 border-b-2 border-gray-200 pb-2 overflow-x-auto">
                {dashboardTabs.map(tab => (
                     <Link href={tab.href} key={tab.label}>
                        <Button variant={tab.active ? "default" : "ghost"} className={cn(tab.active ? "btn-admin" : "text-gray-600 hover:bg-gray-100")}>
                           <tab.icon className="mr-2 h-4 w-4" />
                           {tab.label}
                        </Button>
                    </Link>
                ))}
            </div>

             <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <StatsCard title="Total Pemilih" value={stats.totalVoters} icon={<Users className="text-white"/>} color="red" />
                <StatsCard title="Sudah Memilih" value={stats.votedCount} icon={<UserCheck className="text-white"/>} color="green" />
                <StatsCard title="Belum Memilih" value={stats.notVotedCount} icon={<UserX className="text-white"/>} color="yellow" />
                <StatsCard title="Partisipasi" value={stats.participation} icon={<Percent className="text-white"/>} color="blue" />
            </div>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-700">Analisis Suara per Kandidat</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {chartData.votesByCandidate.map(data => (
                        <Card key={data.candidateId}>
                            <CardHeader>
                                <CardTitle>{data.candidateName}</CardTitle>
                                <CardDescription>Total Suara: <span className="font-bold">{data.totalVotes}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="h-[250px]">
                                  <RealtimeChart chartType="individual" individualData={data.classData} />
                               </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-bold text-gray-700">Grafik Suara Keseluruhan</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Suara Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full max-w-2xl mx-auto">
                            <RealtimeChart chartType="combined" combinedData={chartData.totalVoteCounts} />
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

const StatsCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: 'red' | 'green' | 'yellow' | 'blue' }) => {
    const colorClasses = {
        red: "bg-red-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        blue: "bg-blue-500"
    };

    return (
        <Card className="p-4">
            <CardContent className="flex items-center justify-between p-0">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className={`p-4 rounded-full ${colorClasses[color]}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}
