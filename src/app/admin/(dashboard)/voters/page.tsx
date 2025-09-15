"use client";

import { useEffect, useState } from 'react';
import { getVoters } from '@/lib/data';
import { VotersTable } from './voters-table';
import type { Voter } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function VotersPage() {
    const [voters, setVoters] = useState<Voter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // No need to set loading to true here, it's the initial state
                const votersData = await getVoters();
                setVoters(votersData);
            } catch (error) {
                console.error("Failed to fetch voters:", error);
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
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-red-500">Data Pemilih</h1>
                <p className="text-gray-500">Panel kontrol data pemilih OSIS SERENTAK</p>
            </div>
            <VotersTable initialVoters={voters} />
        </div>
    );
}
