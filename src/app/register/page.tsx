"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isActionError } from "@/lib/action-result";
import { registerUser } from "@/lib/actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);

    const result = await registerUser(formData);
    setLoading(false);

    if (isActionError(result)) {
      toast.error(result.error);
      return;
    }

    toast.success("Ro'yxatdan o'tdingiz!");

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="mt-2 text-gray-500">Yangi hisob yarating</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ism</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Parol</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Kutilmoqda..." : "Ro'yxatdan o'tish"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-gray-500">
          Ro&apos;yxatdan o&apos;tish orqali{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Foydalanish shartlari
          </Link>{" "}
          va{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Maxfiylik siyosati
          </Link>
          ga rozilik bildirasiz.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Hisobingiz bormi?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Kirish
        </Link>
      </p>
    </div>
  );
}
