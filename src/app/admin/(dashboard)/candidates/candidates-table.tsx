
"use client";

import React, { useState, useMemo, useTransition } from 'react';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, FileUp, PenBox, PlusCircle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CandidateForm } from './candidate-form';
import { getInitials } from '@/lib/utils';
import { DeleteCandidateButton } from './delete-candidate-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { importCandidates } from '@/lib/data';
import { DeleteAllCandidatesButton } from './delete-all-candidates-button';

export function CandidatesTable({ initialCandidates }: { initialCandidates: Candidate[] }) {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const fileInputRef = React.createRef<HTMLInputElement>();

    React.useEffect(() => {
        setCandidates(initialCandidates);
    }, [initialCandidates]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate =>
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.slogan.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [candidates, searchTerm]);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const imported: Omit<Candidate, 'id' | 'votes'>[] = json.map((row: any) => {
                    // Make imageUrl optional by checking only for required fields
                    if (!row.name || !row.slogan || !row.vision || !row.mission) return null;
                    const platform = `Visi: ${row.vision}\nMisi:\n${String(row.mission).split(/, ?|\n/).map(m => `- ${m.trim()}`).join('\n')}`;
                    return {
                        name: String(row.name),
                        slogan: String(row.slogan),
                        platform: platform,
                        imageUrl: String(row.imageUrl || ''), // Use empty string if imageUrl is missing
                    };
                }).filter((c): c is Omit<Candidate, 'id' | 'votes'> => c !== null);

                if (imported.length === 0) {
                     toast({ 
                         variant: 'destructive', 
                         title: 'Import Gagal', 
                         description: 'Tidak ada data valid. Pastikan file Excel memiliki kolom: name, slogan, vision, dan mission.' 
                    });
                     return;
                }

                startTransition(async () => {
                    const result = await importCandidates(imported);
                     if (result.status === 'success') {
                        toast({ title: 'Import Berhasil', description: `${result.data?.importedCount || 0} kandidat berhasil diimpor.` });
                        router.refresh();
                    } else {
                        toast({ variant: 'destructive', title: 'Import Gagal', description: result.message });
                    }
                });

            } catch (error) {
                const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses file.';
                toast({ variant: 'destructive', title: 'Format File Salah', description: message });
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    const handleExport = () => {
        const parsePlatform = (platform: string) => {
            const visiMatch = platform.match(/Visi:([\s\S]*?)(?=Misi:|$)/);
            const misiMatch = platform.match(/Misi:([\s\S]*)/);
            const vision = visiMatch ? visiMatch[1].trim() : platform;
            let mission = misiMatch ? misiMatch[1].trim().replace(/^- /gm, '') : '';
            return { vision, mission };
        };

        const dataToExport = candidates.map(c => {
            const { vision, mission } = parsePlatform(c.platform);
            return {
                "id": c.id,
                "name": c.name,
                "slogan": c.slogan,
                "imageUrl": c.imageUrl,
                "vision": vision,
                "mission": mission.replace(/\n/g, ', '),
                "votes": c.votes,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kandidat");
        XLSX.writeFile(workbook, "data-kandidat.xlsx");
    };
    
    return (
         <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Cari nama atau slogan..."
                            className="w-full rounded-lg bg-white pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                            <FileUp className="mr-2 h-4 w-4" /> {isPending ? 'Mengimpor...' : 'Import'}
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" /> Export
                        </Button>
                         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                 <Button className="btn-admin">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kandidat
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                <DialogTitle>Tambah Kandidat Baru</DialogTitle>
                                <DialogDescription>
                                    Isi detail kandidat untuk menampilkannya di halaman depan dan halaman voting.
                                </DialogDescription>
                                </DialogHeader>
                                <CandidateForm onFormSubmit={() => {
                                    setIsAddModalOpen(false);
                                    router.refresh();
                                }} />
                            </DialogContent>
                        </Dialog>
                        <DeleteAllCandidatesButton hasCandidates={candidates.length > 0} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((candidate) => (
                             <Card key={candidate.id} className="flex flex-col text-center hover:shadow-lg transition-shadow">
                                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center">
                                    <Avatar className="h-24 w-24 mb-4 text-3xl">
                                        <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                        <AvatarFallback className="bg-gray-200 text-gray-700">{getInitials(candidate.name)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-bold text-lg">{candidate.name}</h3>
                                    <p className="text-sm text-gray-500 italic">"{candidate.slogan}"</p>
                                    <p className="text-4xl font-bold text-red-500 mt-4">{candidate.votes}</p>
                                    <p className="text-sm text-gray-600">Suara</p>
                                </CardContent>
                                <div className="border-t p-2 flex justify-end gap-1">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <PenBox className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                            <DialogTitle>Edit Kandidat</DialogTitle>
                                            <DialogDescription>
                                                Perbarui detail kandidat di bawah ini. Perubahan akan terlihat di halaman depan & voting.
                                            </DialogDescription>
                                            </DialogHeader>
                                            <CandidateForm candidate={candidate} onFormSubmit={() => {
                                                // Manually close the dialog and refresh
                                                document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new Event('click'));
                                                router.refresh();
                                            }} />
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <DeleteCandidateButton candidateId={candidate.id} />

                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>Tidak ada data kandidat yang dapat ditampilkan.</p>
                        <p>Coba tambahkan kandidat baru atau ubah filter pencarian Anda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
