"use client"

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useTeamData } from "@/hooks/use-team-data"

export function TeamProgressChart() {
  const { progressData } = useTeamData()

  if (!progressData || progressData.length === 0) {
    return <div>Loading chart data...</div>
  }

  const maxMeters = Math.max(...progressData.map((d) => d.meters)) * 1.1

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progressData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, maxMeters]} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={30} />
          <Tooltip />
          {/* Daily meters */}
          <Line type="monotone" dataKey="meters" name="Daily Meters" stroke="#2563eb" strokeWidth={2} dot={false} />
          {/* Daily average line */}
          <Line
            type="monotone"
            dataKey="target"
            name="Daily Average"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
