
"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import type { Candidate } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PALETTE = ['#22c55e', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};


export function ResultsChart({ candidates, totalVotes }: { candidates: Candidate[], totalVotes: number }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    if (!candidates || candidates.length === 0) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <p className="text-gray-300">Belum ada data kandidat untuk ditampilkan.</p>
            </div>
        );
    }
    
    // Position labels around the pie chart
    const getPosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + 40 * Math.cos(angle);
        const y = 50 + 40 * Math.sin(angle);
        
        let alignment = '';
        if (x > 60) alignment += 'justify-start ';
        else if (x < 40) alignment += 'justify-end ';
        else alignment += 'justify-center ';

        if (y > 60) alignment += 'items-start';
        else if (y < 40) alignment += 'items-end';
        else alignment += 'items-center';

        return { left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%)`, alignment };
    }

    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

    return (
        <div className="w-full h-[500px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={sortedCandidates}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="votes"
                        onMouseEnter={onPieEnter}
                        paddingAngle={5}
                    >
                        {sortedCandidates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                    </Pie>
                </RechartsPieChart>
            </ResponsiveContainer>

            {sortedCandidates.map((candidate, index) => {
                const { left, top, transform, alignment } = getPosition(index, sortedCandidates.length);
                const isActive = index === activeIndex;
                const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                
                return (
                     <div key={candidate.id} 
                         className={`absolute flex ${alignment} transition-all duration-300`}
                         style={{ left, top, transform: `${transform} ${isActive ? 'scale(1.1)' : 'scale(1)'}` }}
                     >
                        <div 
                            className="p-3 rounded-lg card-3d w-48 text-left"
                            style={{
                                borderColor: PALETTE[index % PALETTE.length],
                                boxShadow: isActive ? `0 0 20px ${PALETTE[index % PALETTE.length]}` : 'none',
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <div className="flex items-center mb-2">
                                <Avatar className="h-10 w-10 mr-2 border-2" style={{borderColor: PALETTE[index % PALETTE.length]}}>
                                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                    <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                </Avatar>
                                <div className="font-bold text-lg text-white">
                                    {percentage.toFixed(1)}%
                                </div>
                            </div>
                            <h4 className="font-semibold text-white text-sm truncate">{candidate.name}</h4>
                            <p className="text-gray-300 text-xs">{candidate.votes.toLocaleString()} Suara</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
