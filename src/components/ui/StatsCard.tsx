"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "emerald" | "blue" | "amber" | "rose" | "purple" | "indigo";
  trend?: { value: number; label: string };
}

const colorMap = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  rose: "bg-rose-50 text-rose-600 border-rose-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const iconBg = {
  emerald: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  purple: "bg-purple-100 text-purple-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "emerald",
  trend,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border p-5 shadow-sm", colorMap[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBg[color])}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
