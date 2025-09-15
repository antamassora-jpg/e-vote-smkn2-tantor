"use client";

import { useEffect, useState } from 'react';
import { getCandidates } from '@/lib/data';
import type { Candidate } from '@/lib/types';
import { CandidatesTable } from './candidates-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // We don't need to set loading to true, it's the initial state.
                const candidatesData = await getCandidates();
                setCandidates(candidatesData);
            } catch (error) {
                console.error("Failed to fetch candidates:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();

        // Optional: add a refresh interval if needed
        const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-red-500">Manajemen Kandidat</h1>
                <p className="text-gray-500">Panel untuk mengatur data kandidat yang akan tampil di halaman depan dan halaman voting.</p>
            </div>
            <CandidatesTable initialCandidates={candidates} />
        </div>
    );
}
