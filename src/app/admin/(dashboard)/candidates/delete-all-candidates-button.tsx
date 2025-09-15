
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { deleteAllCandidates } from "@/lib/data";

export function DeleteAllCandidatesButton({ hasCandidates }: { hasCandidates: boolean }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteAllCandidates();
            if (result.status === 'success') {
                toast({
                    title: "Berhasil",
                    description: result.message
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Gagal Menghapus",
                    description: result.message,
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending || !hasCandidates}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Semua
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin menghapus SEMUA data kandidat?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini akan menghapus seluruh data kandidat dan suara yang terkait secara permanen. Pastikan Anda sudah melakukan backup jika diperlukan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                        {isPending ? "Menghapus..." : "Ya, Hapus Semua"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
