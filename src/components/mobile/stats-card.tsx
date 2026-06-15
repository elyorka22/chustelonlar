"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: number | string;
  index?: number;
}

export function StatsCard({ label, value, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex-1 rounded-[20px] bg-white p-4 text-center card-shadow"
    >
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-gray-500 leading-tight">
        {label}
      </p>
    </motion.div>
  );
}
