"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import '@/index.css'


export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a confirmation link.");
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    router.push("/admin-login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <form onSubmit={handleSignUp} className="w-full max-w-sm space-y-6 p-6 rounded shadow border border-black bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-[#65bd7d]">Sign Up</h1>
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            className="bg-gray-900 text-white border-black focus:border-[#65bd7d] focus:ring-[#65bd7d]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input
            id="password"
            type="password"
            className="bg-gray-900 text-white border-black focus:border-[#65bd7d] focus:ring-[#65bd7d]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-[#65bd7d] text-sm">{success}</div>}
        <Button
          type="submit"
          className="w-full bg-[#65bd7d] text-black hover:bg-[#4fa366] border border-black"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm">Already have an account?</span>
          <Link href="/table" className="text-[#65bd7d] underline">Login</Link>
        </div>
        <Button
          type="button"
          onClick={handleAdminLogin}
          className="w-full mt-2 bg-gray-700 text-white border border-black hover:bg-[#65bd7d] hover:text-black"
        >
          Admin Login
        </Button>
      </form>
    </div>
  );
}
