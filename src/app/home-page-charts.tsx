
"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, UserCheck, TrendingUp, Users } from 'lucide-react';

const iconMap: { [key: string]: LucideIcon } = {
  UserCheck: UserCheck,
  TrendingUp: TrendingUp,
  Users: Users,
};


interface Activity {
    icon: string; // Now a string name
    text: string;
    time: string;
    color: string;
}

interface HomeChartsProps {
    participationData: { time: string; value: number }[];
    recentActivities: Activity[];
}

export function HomeCharts({ participationData, recentActivities }: HomeChartsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white rounded-2xl shadow-xl">
                <CardHeader>
                    <CardTitle>Tren Partisipasi</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={participationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis allowDecimals={false} domain={[0, 'dataMax']} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" name="Suara Masuk" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        
            <Card className="bg-white rounded-2xl shadow-xl">
                <CardHeader>
                    <CardTitle>Aktivitas Terkini</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                            const IconComponent = iconMap[activity.icon];
                            return (
                                <div key={index} className="flex items-start">
                                    <div className={`p-2 bg-gray-100 rounded-full mr-4 ${activity.color}`}>
                                        {IconComponent && <IconComponent className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{activity.text}</p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        }) : (
                            <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas tercatat.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
