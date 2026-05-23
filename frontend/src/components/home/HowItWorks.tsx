"use client";
import { ShoppingCart, Lock, Package, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: ShoppingCart,
    title: "Chọn & Mua",
    desc: "Tìm tài khoản game phù hợp, nhấn Mua ngay. Tiền được giữ trong hệ thống Escrow an toàn.",
    color: "from-blue-500 to-blue-600",
    glow: "shadow-glow-blue",
  },
  {
    step: "02",
    icon: Lock,
    title: "Escrow Giữ Tiền",
    desc: "Hệ thống giữ tiền đến khi giao dịch hoàn tất. Seller không nhận được tiền cho đến khi bạn xác nhận.",
    color: "from-purple-500 to-purple-600",
    glow: "shadow-glow-purple",
  },
  {
    step: "03",
    icon: Package,
    title: "Nhận Tài Khoản",
    desc: "Seller bàn giao thông tin đăng nhập trong vòng 24h. Bạn kiểm tra và đổi mật khẩu.",
    color: "from-cyan-500 to-cyan-600",
    glow: "shadow-glow-cyan",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Xác Nhận & Hoàn Tất",
    desc: "Xác nhận đã nhận tài khoản thành công. Tiền được giải phóng cho Seller. Giao dịch hoàn tất!",
    color: "from-green-500 to-green-600",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
  },
];

export default function HowItWorks() {
  return (
    <section className="container-main py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Quy trình mua bán{" "}
          <span className="text-gradient">an toàn</span>
        </h2>
        <p className="text-[#8b9ab5] max-w-md mx-auto text-sm leading-relaxed">
          Hệ thống Escrow đảm bảo cả người mua và người bán đều được bảo vệ trong mọi giao dịch
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        {/* Connector line (desktop) */}
        <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />

        {STEPS.map(({ step, icon: Icon, title, desc, color, glow }, i) => (
          <div key={step} className="relative flex flex-col items-center text-center group">
            {/* Arrow between steps (mobile/tablet) */}
            {i < STEPS.length - 1 && (
              <div className="sm:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-[#2d3748] rotate-90" />
              </div>
            )}

            {/* Icon */}
            <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center ${glow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-9 h-9 text-white" />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0a0d10] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#8b9ab5]">
                {step}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-[#8b9ab5] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
