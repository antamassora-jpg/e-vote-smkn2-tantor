
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import type { Candidate } from "@/lib/types";
import { useTransition } from "react";
import { saveCandidate } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama kandidat minimal 3 karakter." }),
  slogan: z.string().min(5, { message: "Slogan minimal 5 karakter." }),
  imageUrl: z.string().url({ message: "Harap masukkan URL gambar yang valid." }).optional().or(z.literal('')),
  vision: z.string().min(10, { message: "Visi minimal 10 karakter." }),
  mission: z.string().min(10, { message: "Misi minimal 10 karakter." }),
});

type CandidateFormValues = z.infer<typeof formSchema>;

interface CandidateFormProps {
    candidate?: Candidate;
    onFormSubmit?: () => void;
}

const parsePlatform = (platform: string | undefined) => {
    if (!platform) return { vision: '', mission: '' };
    // Use [\s\S] to be compatible with older JS targets
    const visiMatch = platform.match(/Visi:([\s\S]*?)(?=Misi:|$)/);
    const misiMatch = platform.match(/Misi:([\s\S]*)/);
    const vision = visiMatch ? visiMatch[1].trim() : platform;
    let mission = misiMatch ? misiMatch[1].trim() : '';
    mission = mission.replace(/^- /gm, ''); // remove leading dashes
    return { vision, mission };
}

export function CandidateForm({ candidate, onFormSubmit }: CandidateFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const { vision: defaultVision, mission: defaultMission } = parsePlatform(candidate?.platform);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: candidate?.name || "",
      slogan: candidate?.slogan || "",
      imageUrl: candidate?.imageUrl || "",
      vision: candidate?.vision || defaultVision,
      mission: candidate?.mission || defaultMission,
    },
  });

  const onSubmit = (data: CandidateFormValues) => {
    startTransition(async () => {
        const platform = `Visi: ${data.vision}\nMisi:\n${data.mission.split('\n').map(m => `- ${m.trim()}`).join('\n')}`;
        const isEditing = !!candidate?.id;

        const candidateData = {
            id: candidate?.id,
            name: data.name,
            slogan: data.slogan,
            platform: platform,
            imageUrl: data.imageUrl || '',
            votes: candidate?.votes || 0,
        };

        const result = await saveCandidate(candidateData);

        if (result.status === 'success') {
            toast({
                title: isEditing ? "Kandidat Diperbarui" : "Kandidat Ditambahkan",
                description: `Data untuk ${data.name} telah berhasil disimpan.`,
            });
            
            onFormSubmit?.();
            
            if (!isEditing) {
                form.reset({ name: '', slogan: '', imageUrl: '', vision: '', mission: '' }); 
            }
            router.refresh();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kandidat</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Haris & Anies" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slogan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slogan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Maju Bersama, Cerdas Berkarya" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Gambar (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Kosongkan untuk memakai inisial nama" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tuliskan Visi Kandidat. Contoh: Menjadi OSIS yang berprestasi, inovatif, dan menjadi teladan bagi seluruh siswa."
                  className="resize-y"
                  rows={3}
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="mission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Misi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tuliskan Misi Kandidat. Pisahkan setiap poin misi dengan baris baru (Enter)."
                  className="resize-y"
                  rows={5}
                  {...field}
                  disabled={isPending}
                />
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
  );
}
