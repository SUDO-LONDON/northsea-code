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
    const [companyName, setCompanyName] = useState("");
    const [position, setPosition] = useState("");
    const [country, setCountry] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const router = useRouter();

    const validatePhone = (value: string) => {
        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        if (!phoneRegex.test(value)) {
            setPhoneError("Invalid phone number format. Use international format e.g. +14155552671.");
        } else {
            setPhoneError(null);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (phoneError) {
            setLoading(false);
            return;
        }

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: 'https://northseatrading.vercel.app',
                data: {
                    company_name: companyName,
                    position,
                    country_of_incorporation: country,
                    phone,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            const user = data?.user;
            if (user) {
                // Ensure profile exists
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', user.id)
                  .single();
                if (!profile && !profileError) {
                  await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    company_name: companyName,
                    position,
                    country_of_incorporation: country,
                    phone,
                    created_at: new Date().toISOString(),
                  });
                }
                // Fallback: call edge function directly to dispatch email
                try {
                  await fetch('https://qsqihdpfhfzcrwhkxgxu.supabase.co/functions/v1/send-user-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      record: {
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                        raw_user_meta_data: {
                          company_name: companyName,
                          position,
                          country_of_incorporation: country,
                          phone,
                        }
                      }
                    })
                  });
                } catch (e) {
                  console.warn('Edge function email fallback failed', e);
                }
            }
            setSuccess("Check your email for a confirmation link.");
        }
        setLoading(false);
    };

    const handleAdminLogin = () => {
        router.push("/admin-login");
    };

    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center space-y-4 mb-4">
                <h1 className="text-4xl font-bold text-center">Create your Northsea account</h1>
                <p className="text-gray-500 text-center">Register below to get started</p>
            </div>
            <div className="w-full max-w-sm">
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="e.g. Northsea Trading"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            type="text"
                            placeholder="e.g. Manager"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country of Incorporation</Label>
                        <Input
                            id="country"
                            type="text"
                            placeholder="e.g. United States"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="e.g. +14155552671"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                validatePhone(e.target.value);
                            }}
                            required
                        />
                        {phoneError && <div className="text-red-500 text-sm">{phoneError}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="e.g. user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>

                <div className="flex justify-between items-center mt-4 text-sm">
                    <span>Already have an account?</span>
                    <Link href="/" className="text-primary underline">Login</Link>
                </div>

                <Button
                    type="button"
                    onClick={handleAdminLogin}
                    variant="secondary"
                    className="w-full mt-4"
                >
                    Admin Login
                </Button>
            </div>
        </div>
    );
}
