import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex flex-col items-center space-y-4 mb-4">
                <h1 className="text-4xl font-bold text-center">Welcome to Northsea</h1>
                <p className="text-gray-500 text-center">Sign in to access your account</p>
            </div>
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}
