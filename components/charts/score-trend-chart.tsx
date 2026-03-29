"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ScoreTrendChart({
  data
}: {
  data: Array<{ date: string; clinicName: string; totalScore: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(41,44,31,0.12)" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalScore" name="Score %" stroke="#0d6a5b" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
