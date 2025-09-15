"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSystemSettings } from "@/lib/data";
import { SettingsForm } from "./settings-form";
import type { SystemSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // No need to set loading to true, it's the initial state.
                const settingsData = await getSystemSettings();
                setSettings(settingsData);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
                <CardDescription>
                    Atur jadwal dan status sistem pemilihan. Perubahan akan berlaku secara global.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {isLoading || !settings ? (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    <SettingsForm initialSettings={settings} />
                )}
            </CardContent>
        </Card>
    );
}
