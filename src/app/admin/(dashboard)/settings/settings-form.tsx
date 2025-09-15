
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import type { SystemSettings } from "@/lib/types";
import { updateSystemSettings } from "@/lib/data";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";


const settingsSchema = z.object({
  startDate: z.date({
    required_error: "Tanggal mulai harus diisi.",
  }),
  endDate: z.date({
    required_error: "Tanggal selesai harus diisi.",
  }),
  isVotingActive: z.boolean().default(false),
}).refine((data) => data.endDate > data.startDate, {
  message: "Tanggal selesai harus setelah tanggal mulai.",
  path: ["endDate"],
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm({ initialSettings }: { initialSettings: SystemSettings }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      startDate: new Date(initialSettings.startDate),
      endDate: new Date(initialSettings.endDate),
      isVotingActive: initialSettings.isVotingActive,
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    startTransition(async () => {
        const result = await updateSystemSettings(values);
        if (result.status === 'success') {
            toast({
                title: "Pengaturan Disimpan",
                description: "Pengaturan sistem telah berhasil diperbarui.",
            });
            router.refresh(); 
        } else {
            toast({
                variant: 'destructive',
                title: "Gagal Menyimpan",
                description: `Terjadi kesalahan: ${result.message}`,
            });
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Tanggal Mulai Voting</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormDescription>
                    Waktu dimulainya siswa dapat memberikan suara.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Tanggal Selesai Voting</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < form.getValues('startDate')}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormDescription>
                    Waktu terakhir siswa dapat memberikan suara.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="isVotingActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Status Sistem Voting
                </FormLabel>
                <FormDescription>
                  Aktifkan untuk mengizinkan siswa login dan memilih. Nonaktifkan untuk menutup sesi voting.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending} className="btn-admin min-w-[150px]">
                {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

