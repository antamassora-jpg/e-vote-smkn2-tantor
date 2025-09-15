
"use client";

import { useState, useTransition, ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Voter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { saveVoter } from "@/lib/data";

const formSchema = z.object({
  nis: z.string().min(1, "NIS tidak boleh kosong."),
  name: z.string().min(3, "Nama minimal 3 karakter."),
  class: z.string().min(2, "Kelas tidak boleh kosong."),
  password: z.string().min(5, "Password minimal 5 karakter."),
});

type VoterFormValues = z.infer<typeof formSchema>;

interface VoterFormModalProps {
    voter?: Voter;
    children: ReactNode;
}

export function VoterFormModal({ voter, children }: VoterFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<VoterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nis: voter?.nis || "",
      name: voter?.name || "",
      class: voter?.class || "",
      password: voter?.password || "",
    },
  });
  
  // Reset form when dialog opens with new data or voter data changes.
  useEffect(() => {
    if (open) {
      form.reset({
        nis: voter?.nis || "",
        name: voter?.name || "",
        class: voter?.class || "",
        password: voter?.password || "",
      });
    }
  }, [open, voter, form]);


  const onSubmit = (data: VoterFormValues) => {
    startTransition(async () => {
        const voterData: Voter = {
            ...data,
            hasVoted: voter?.hasVoted || false,
            voteTime: voter?.voteTime || null,
            votedFor: voter?.votedFor || null
        };
        const result = await saveVoter(voterData);

        if (result.status === 'success') {
            toast({
                title: voter?.nis ? "Data Pemilih Diperbarui" : "Pemilih Ditambahkan",
                description: `Data untuk ${data.name} telah berhasil disimpan.`,
            });
            router.refresh();
            setOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: "Gagal Menyimpan",
                description: result.message,
            });
        }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{voter ? 'Edit Data Pemilih' : 'Tambah Pemilih Baru'}</DialogTitle>
          <DialogDescription>
            {voter ? 'Perbarui detail pemilih di bawah ini.' : 'Isi detail pemilih untuk menambahkannya ke daftar.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="nis"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nomor Induk Siswa (NIS)</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: 2024001" {...field} disabled={isPending || !!voter} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Budi Sanjaya" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: XII TKJ 1" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Min. 5 karakter" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="pt-4 flex justify-end">
                    <Button type="submit" className="btn-admin" disabled={isPending}>
                        {isPending ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
