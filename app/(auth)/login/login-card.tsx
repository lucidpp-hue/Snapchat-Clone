"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginCard() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
            } else {
                router.push("/chat");
                router.refresh();
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-2'>
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
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='bg-transparent border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400'
                    />
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </Button>
            </form>
            <div className='mt-4 text-center text-[13px]'>
                <span>New to SnapNext? </span>
                <Link className='text-blue-500 hover:underline text-[13px] mr-1' href='/signup'>
                    Sign Up
                </Link>
                {error ? <p className='text-sm text-red-500 mt-2'>{error}</p> : null}
            </div>
        </>
    );
}
