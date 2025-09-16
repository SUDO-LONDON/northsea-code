"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

export default function AdminSignup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (supabaseError) {
      setError(supabaseError.message)
      setLoading(false)
      return
    }

    setSuccess(
      "Signup successful! Please wait for admin approval before you can log in."
    )
    setLoading(false)
    setEmail("")
    setPassword("")
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col items-center space-y-4 mb-4">
        <h1
          className="text-4xl font-bold text-center"
          style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            color: '#fefeff',
            textAlign: 'center'
          }}
        >
          Admin Signup
        </h1>
        <p
          className="text-gray-500 text-center"
          style={{ color: '#9ca3af', textAlign: 'center' }}
        >
          Request access to the admin dashboard
        </p>
      </div>
      <div className="w-full max-w-sm" style={{ width: '100%', maxWidth: '24rem' }}>
        <div className={cn("grid gap-6")} style={{ display: 'grid', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4" style={{ display: 'grid', gap: '1rem' }}>
              {error && (
                <div
                  className="text-red-500 text-sm text-center p-2 bg-red-50 border border-red-200 rounded"
                  style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    padding: '0.5rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.375rem'
                  }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="text-green-600 text-sm text-center p-2 bg-green-50 border border-green-200 rounded"
                  style={{
                    color: '#16a34a',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    padding: '0.5rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.375rem'
                  }}
                >
                  {success}
                </div>
              )}
              <div className="grid gap-1" style={{ display: 'grid', gap: '0.25rem' }}>
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1" style={{ display: 'grid', gap: '0.25rem' }}>
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button disabled={loading} type="submit">
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                )}
                Request Admin Access
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#2d2a3e' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="bg-background px-2 text-muted-foreground"
                style={{
                  backgroundColor: '#0f0d21',
                  padding: '0 0.5rem',
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Or
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin-login")}>Back to Admin Login</Button>
        </div>
      </div>
    </div>
  )
}

