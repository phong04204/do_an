"use client";
import { Users, ShoppingBag, CheckCircle, Clock } from "lucide-react";

const STATS = [
  { icon: Users,        value: "50,000+", label: "Người dùng",         color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20"   },
  { icon: ShoppingBag, value: "120,000+", label: "Giao dịch",          color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { icon: CheckCircle, value: "99.2%",    label: "Thành công",          color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
  { icon: Clock,       value: "24/7",     label: "Hỗ trợ trực tuyến",  color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
];

export default function StatsSection() {
  return (
    <section className="container-main py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, value, label, color, bg, border }) => (
          <div
            key={label}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${border} ${bg}`}
          >
            <div className={`p-2.5 rounded-xl ${bg} border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold font-orbitron ${color}`}>{value}</p>
              <p className="text-xs text-[#8b9ab5]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
