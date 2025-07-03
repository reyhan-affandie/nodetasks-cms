"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import DefaultLayout from "@/components/layout/app.layout";
import { get } from "@/actions/actions";
import { useTranslations } from "next-intl";

// Canonical phase keys, used for translation and color mapping
const PHASE_KEYS = ["to_do", "in_progress", "in_review", "closed", "cancelled"];

// Color map for each phase key
const PHASE_COLORS: Record<string, string> = {
  to_do: "#6B7280",
  in_progress: "#3B82F6",
  in_review: "#A855F7",
  closed: "#10B981",
  cancelled: "#EF4444",
};

export default function DashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<{ total: number; phases: Record<string, number> }>({
    total: 0,
    phases: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await get("dashboard");
        setStats(res?.data || { total: 0, phases: {} });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Build the phaseData for display (use phase key everywhere)
  const phaseData = PHASE_KEYS.filter((key) => key in stats.phases).map((key) => ({
    key,
    value: stats.phases[key],
    color: PHASE_COLORS[key] || "#d1d5db",
    tname: t(key),
  }));

  return (
    <DefaultLayout>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>{t("total_tasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "..." : stats.total}</div>
          </CardContent>
        </Card>
        {/* Total Tasks by Phase */}
        <Card>
          <CardHeader>
            <CardTitle>{t("total_tasks_by_phase")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {loading ? (
                <li>{t("loading")}</li>
              ) : phaseData.length === 0 ? (
                <li>{t("no_phase_data")}</li>
              ) : (
                phaseData.map((phase) => (
                  <li key={phase.key} className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: phase.color }} />
                    <span className="font-semibold">{phase.tname}:</span>
                    <span className="ml-2">{phase.value}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      {/* 2nd row - Bar chart */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("task_breakdown_by_phase")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="text-muted-foreground">{t("loading_chart")}</div>
            ) : phaseData.length === 0 ? (
              <div className="text-muted-foreground">{t("no_phase_data")}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData}>
                  <XAxis dataKey="tname" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value">
                    {phaseData.map((entry, idx) => (
                      <Cell key={`cell-bar-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
