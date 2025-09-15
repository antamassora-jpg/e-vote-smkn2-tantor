
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, Pie, PieChart, Legend, Line, ComposedChart } from 'recharts';
import type { VoteCount } from '@/lib/types';

interface IndividualChartProps {
    chartType: 'individual';
    individualData: { name: string; votes: number }[];
}

interface CombinedChartProps {
    chartType: 'combined';
    combinedData: VoteCount[];
}

type RealtimeChartProps = IndividualChartProps | CombinedChartProps;


const PALETTE = ['#ef4444', '#3b82f6', '#16a34a', '#f97316', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const chartLabel = label || payload[0].name;

      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-bold text-gray-800">{chartLabel}</p>
          {payload.map((pld: any, index: number) => (
             <p key={index} className="text-sm" style={{ color: pld.fill }}>
                {`${pld.name}: ${pld.value}`}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

export function RealtimeChart(props: RealtimeChartProps) {
  
  if (props.chartType === 'individual') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
            data={props.individualData} 
            margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
            barSize={25}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }} />
            <Bar dataKey="votes" name="Suara" radius={[4, 4, 0, 0]}>
                {props.individualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
            </Bar>
            <Line type="monotone" dataKey="votes" name="Tren" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (props.chartType === 'combined') {
     if (!props.combinedData || props.combinedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Belum ada suara masuk untuk ditampilkan.</p>
            </div>
        );
    }
    return (
       <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={props.combinedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            innerRadius={70}
            paddingAngle={5}
            dataKey="votes"
            nameKey="name"
          >
            {props.combinedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} className="focus:outline-none ring-0" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value, entry) => <span className="text-gray-600">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null;
}
