"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { APP_NAME } from "@/lib/constants";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleGoogleLogin = () => signIn("google", { callbackUrl: "/" });

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) { toast.error("Email yoki parol noto'g'ri"); return; }
    router.push("/");
    router.refresh();
  };

  const inputClass = "h-[52px] w-full rounded-2xl bg-secondary px-4 text-[15px] font-medium outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex min-h-screen flex-col justify-center bg-white px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-xl font-extrabold text-white shadow-lg shadow-primary/30">
            CE
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">{APP_NAME}</h1>
          <p className="mt-2 text-[15px] text-gray-500">Hisobingizga kiring</p>
        </div>

        {searchParams.get("error") === "banned" && (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-[13px] text-red-600">
            Hisobingiz bloklangan
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-[15px] font-semibold card-shadow active:scale-[0.98] transition-transform"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google orqali kirish
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-[13px] text-gray-400">yoki</span></div>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-3">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} required />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Parol" className={inputClass} required />
            <button type="submit" disabled={loading} className="h-[52px] w-full rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50">
              {loading ? "Kutilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[14px] text-gray-500">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-semibold text-primary">Ro&apos;yxatdan o&apos;tish</Link>
        </p>
      </motion.div>
    </div>
  );
}
