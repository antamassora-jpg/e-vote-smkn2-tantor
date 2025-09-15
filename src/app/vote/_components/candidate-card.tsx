
"use client";

import { useState } from 'react';
import type { Candidate } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Info, List, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitVote } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';


export function CandidateCard({ candidate }: { candidate: Candidate }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleVote = async () => {
        setIsLoading(true);
        try {
            const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
            if (!studentData.nis) {
                throw new Error("Data siswa tidak ditemukan.");
            }
            
            const result = await submitVote(studentData.nis, candidate.id);

            if (result.status === 'success') {
                // Update localStorage to reflect vote status
                const updatedStudentData = { ...studentData, hasVoted: true };
                localStorage.setItem('studentData', JSON.stringify(updatedStudentData));

                toast({
                    title: "Suara Berhasil Terkirim!",
                    description: "Terima kasih atas partisipasi Anda.",
                });
                router.push('/vote/voted');
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
            toast({
                variant: 'destructive',
                title: "Gagal Memilih",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const parsePlatform = (platform: string) => {
        const visiMatch = platform.match(/Visi:(.*?)(?=Misi:|$)/s);
        const misiMatch = platform.match(/Misi:(.*)/s);

        const vision = visiMatch ? visiMatch[1].trim() : "Visi tidak tersedia.";
        
        let mission: string[] = [];
        if (misiMatch) {
            mission = misiMatch[1].trim().split('\n').map(item => item.replace(/^-/, '').trim()).filter(Boolean);
        }

        return { vision, mission };
    };

    const { vision, mission } = parsePlatform(candidate.platform);

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden border">
            <div className="p-6 text-center bg-gray-50 border-b">
                <Avatar className="w-24 h-24 text-4xl mx-auto mb-4 gradient-bg text-white shadow-lg">
                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                    <AvatarFallback className="bg-transparent">{getInitials(candidate.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                <p className="text-sm text-gray-500 italic mt-1">"{candidate.slogan}"</p>
            </div>
            
            <div className="p-6 flex-grow">
                 <div className="space-y-4 text-gray-700">
                    <div>
                        <h4 className="font-semibold text-primary mb-2">Visi:</h4>
                        <p className="text-sm line-clamp-3">{vision}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-primary mb-2">Misi:</h4>
                        <ul className="text-sm list-disc list-inside space-y-1">
                            {mission.slice(0, 2).map((item, index) => (
                                <li key={index} className="truncate">{item}</li>
                            ))}
                            {mission.length > 2 && <li className="text-gray-400">...dan lainnya</li>}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t space-y-3">
                 <div className="flex items-center justify-center text-gray-600">
                    <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                    <span className="text-2xl font-bold text-gray-700">{candidate.votes}</span>
                    <span className="ml-2">Suara Sementara</span>
                 </div>
                
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Info className="mr-2 h-4 w-4" /> Lihat Detail
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">{candidate.name}</DialogTitle>
                            <p className="text-muted-foreground italic">"{candidate.slogan}"</p>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <h4 className="font-bold text-lg text-primary">Visi</h4>
                                <p>{vision}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-primary">Misi</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {mission.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full btn-gradient text-white font-bold" disabled={isLoading}>
                             <Check className="mr-2 h-4 w-4" /> 
                             {isLoading ? "Memproses..." : "Pilih Kandidat Ini"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Pilihan Anda</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin memilih <span className="font-bold">{candidate.name}</span>? Pilihan ini tidak dapat diubah setelah dikonfirmasi.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleVote} className="btn-gradient">
                                Ya, Saya Yakin
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
