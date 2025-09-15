"use client";

import { useEffect, useState } from 'react';
import type { Voter } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Hash, School, BadgeCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentInfoCard() {
  const [student, setStudent] = useState<Voter | null>(null);

  useEffect(() => {
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      setStudent(JSON.parse(studentData));
    }
  }, []);

  if (!student) {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 text-3xl gradient-bg text-white">
                <AvatarFallback className="bg-transparent">
                    {getInitials(student.name)}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
                <div className="flex items-center text-gray-600">
                    <Hash className="w-4 h-4 mr-2" />
                    <span>NIS: {student.nis}</span>
                </div>
                <div className="flex items-center text-gray-600">
                    <School className="w-4 h-4 mr-2" />
                    <span>Kelas: {student.class}</span>
                </div>
                 <div className="flex items-center">
                    <BadgeCheck className={`w-4 h-4 mr-2 ${student.hasVoted ? 'text-green-500' : 'text-yellow-500'}`} />
                    <span className={`font-semibold ${student.hasVoted ? 'text-green-600' : 'text-yellow-600'}`}>
                        {student.hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
}
