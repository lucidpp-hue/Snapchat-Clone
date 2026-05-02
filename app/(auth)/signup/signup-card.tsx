"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupCard() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo:
                        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
                        `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error) {
                setError(error.message);
            } else {
                setSuccess("Check your email to confirm your account before logging in.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSignup} className='space-y-4'>
                <div className='space-y-2'>
                    <Input
                        type='text'
                        placeholder='Full Name'
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className='bg-transparent border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400'
                    />
                    <Input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='bg-transparent border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400'
                    />
                    <Input
                        type='password'
                        placeholder='Password (min 6 characters)'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className='bg-transparent border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400'
                    />
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </Button>
            </form>
            <div className='mt-4 text-center text-[13px]'>
                <span>Already have an account? </span>
                <Link className='text-blue-500 hover:underline text-[13px] mr-1' href='/login'>
                    Log in
                </Link>
                {error ? <p className='text-sm text-red-500 mt-2'>{error}</p> : null}
                {success ? <p className='text-sm text-green-500 mt-2'>{success}</p> : null}
            </div>
        </>
    );
}
