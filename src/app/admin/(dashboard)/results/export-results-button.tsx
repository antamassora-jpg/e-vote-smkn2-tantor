
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Candidate } from "@/lib/types";

interface ExportResultsButtonProps {
    candidates: Candidate[];
    totalVotes: number;
}

export function ExportResultsButton({ candidates, totalVotes }: ExportResultsButtonProps) {
    
    const handleExport = () => {
        const headers = ["ID Kandidat", "Nama Kandidat", "Slogan", "Jumlah Suara", "Persentase Suara (%)"];
        
        const safeCsvValue = (val: string | null | undefined): string => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = candidates.map(c => {
            const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : "0.00";
            return [
                safeCsvValue(c.id),
                safeCsvValue(c.name),
                safeCsvValue(c.slogan),
                c.votes.toString(),
                percentage
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + "sep=,\n" // To help Excel open it correctly
            + headers.join(",") + "\n"
            + csvRows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "hasil-pemilihan-osis.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button onClick={handleExport} className="btn-admin">
            <Download className="mr-2 h-4 w-4" />
            Rekapitulasi & Export Hasil
        </Button>
    );
}
