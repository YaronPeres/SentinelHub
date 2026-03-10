"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, ShieldAlert } from "lucide-react";

const COLORS = ['#22d3ee', '#f87171']; // cyan-400, red-400

type ChartProps = {
  data: {
    userResolutionCount: number;
    distanceResolutionCount: number;
    totalIngested: number;
    openTriage: number;
    mttrMins: number;
  }
};

export function AnalyticsOverview({ data }: ChartProps) {
  const pieData = [
    { name: 'User (Human Error)', value: data.userResolutionCount },
    { name: 'Distance (Geo-Anomaly)', value: data.distanceResolutionCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-200/60 uppercase tracking-widest">
              Total Ingested
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalIngested}</div>
            <p className="text-xs text-white/40 mt-1 uppercase">All-time Threats</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-200/60 uppercase tracking-widest">
              Open Triage
            </CardTitle>
            <Target className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.openTriage}</div>
            <p className="text-xs text-white/40 mt-1 uppercase">Pending Review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] text-white font-mono hover:border-cyan-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-200/60 uppercase tracking-widest">
              Mean Time to Resolution
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.mttrMins.toFixed(1)} mins</div>
            <p className="text-xs text-white/40 mt-1 uppercase">Average Closure Speed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-white font-mono col-span-1 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-widest text-white uppercase">Root Cause Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(6,182,212,0.3)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
