
"use client";

import React, { useState, useMemo, useTransition } from 'react';
import type { Voter } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileUp, PenBox, PlusCircle, Search, Trash2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VoterFormModal } from './voter-form-modal';
import { DeleteVoterButton } from './delete-voter-button';
import { importVoters } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { DeleteAllVotersButton } from './delete-all-voters-button';

const ITEMS_PER_PAGE = 10;

export function VotersTable({ initialVoters }: { initialVoters: Voter[] }) {
    const [voters, setVoters] = useState<Voter[]>(initialVoters);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();
    
    const fileInputRef = React.createRef<HTMLInputElement>();

    React.useEffect(() => {
        setVoters(initialVoters);
    }, [initialVoters]);

    const filteredVoters = useMemo(() => {
        return voters.filter(voter =>
            voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voter.nis.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [voters, searchTerm]);

    const totalPages = Math.ceil(filteredVoters.length / ITEMS_PER_PAGE);

    const paginatedVoters = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredVoters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredVoters, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (json.length <= 1) {
                    toast({ variant: 'destructive', title: 'Import Gagal', description: 'File Excel kosong atau tidak ada data.' });
                    return;
                }

                // Assume header is the first row, slice to get data rows
                const dataRows = json.slice(1);

                // Use reduce to build the imported voters array, ensuring no nulls
                const imported: Voter[] = dataRows.reduce((acc: Voter[], row: any) => {
                    if (!row || row.length < 3) {
                        return acc; // Skip empty or invalid rows
                    }
                    
                    const nis = String(row[0] || '');
                    const name = String(row[1] || '');
                    const klass = String(row[2] || '');

                    // Only add if essential data is present
                    if (nis && name && klass) {
                        const password = row[3] ? String(row[3]) : nis; // Default password to NIS if not provided
                        acc.push({ 
                            nis, 
                            name, 
                            class: klass, 
                            password,
                            hasVoted: false,
                            voteTime: null,
                            votedFor: null,
                        });
                    }
                    return acc;
                }, []);


                if (imported.length === 0) {
                     toast({ 
                         variant: 'destructive', 
                         title: 'Import Gagal', 
                         description: 'Tidak ada data pemilih yang valid ditemukan. Pastikan file Excel memiliki kolom: NIS, Nama, dan Kelas.' 
                    });
                     return;
                }

                startTransition(async () => {
                    const result = await importVoters(imported);
                     if (result.status === 'success') {
                        toast({ title: 'Import Berhasil', description: `${result.data?.importedCount || imported.length} data pemilih berhasil diimpor.` });
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
        event.target.value = ''; // Reset file input
    };

    const handleExport = () => {
        const headers = ["NIS", "Nama", "Kelas", "Password", "Status Memilih", "Waktu Memilih"];
        
        const dataToExport = voters.map(v => ({
            "NIS": v.nis,
            "Nama": v.name,
            "Kelas": v.class,
            "Password": v.password, // Be cautious about exporting passwords
            "Status Memilih": v.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
            "Waktu Memilih": v.voteTime ? new Date(v.voteTime).toLocaleString('id-ID') : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
        
        // Auto-fit columns
        const max_width = dataToExport.reduce((w, r) => Math.max(w, r.Nama.length), 10);
        worksheet["!cols"] = [ { wch: 15 }, { wch: max_width }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 } ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pemilih");
        
        XLSX.writeFile(workbook, "data-pemilih.xlsx");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Cari nama atau NIS..."
                            className="w-full rounded-lg bg-white pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                         <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                            <FileUp className="mr-2 h-4 w-4" /> {isPending ? 'Mengimpor...' : 'Import Excel'}
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" /> Export Excel
                        </Button>
                        <VoterFormModal>
                             <Button className="btn-admin">
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
                            </Button>
                        </VoterFormModal>
                         <DeleteAllVotersButton hasVoters={voters.length > 0} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">NIS</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedVoters.length > 0 ? (
                                paginatedVoters.map((voter) => (
                                    <TableRow key={voter.nis}>
                                        <TableCell className="font-medium">{voter.nis}</TableCell>
                                        <TableCell>{voter.name}</TableCell>
                                        <TableCell>{voter.class}</TableCell>
                                        <TableCell>
                                            <Badge variant={voter.hasVoted ? 'default' : 'destructive'} className={voter.hasVoted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {voter.hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <VoterFormModal voter={voter}>
                                                <Button variant="ghost" size="icon">
                                                    <PenBox className="h-4 w-4" />
                                                </Button>
                                            </VoterFormModal>
                                            <DeleteVoterButton nis={voter.nis} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Tidak ada data pemilih yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             {totalPages > 1 && (
                <div className="p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1) }} />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <PaginationItem key={page}>
                                    <PaginationLink href="#" isActive={page === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(page) }}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1) }}/>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
             )}
        </Card>
    );
}

    