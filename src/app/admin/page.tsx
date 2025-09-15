"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is now just a fallback. The primary login is the modal on the homepage.
        // We can check if the user is already logged in and redirect them.
        if (typeof window !== 'undefined') {
            const isAdmin = localStorage.getItem('isAdmin') === 'true';
            if (isAdmin) {
                router.replace('/admin/dashboard');
            }
        }
    }, [router]);

    return (
        <div className="flex flex-col h-screen items-center justify-center text-center p-4 bg-gray-100 text-gray-800">
            <h1 className="text-2xl font-bold mb-4">Halaman Login Admin</h1>
            <p className="mb-6 max-w-md">
                Untuk masuk sebagai admin, silakan gunakan tombol <strong>Login Admin</strong> yang tersedia di pojok kanan atas halaman utama.
            </p>
            <Button asChild className="btn-gradient text-white">
                <Link href="/">Kembali ke Halaman Utama</Link>
            </Button>
        </div>
    );
}
