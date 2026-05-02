"use client"
import React from 'react'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LogoutButton = () => {
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button
            onClick={handleLogout}
            className='bg-black text-white rounded-full p-3 text-xs md:text-sm'
        >
            <LogOut className='cursor-pointer' />
        </Button>
    )
}

export default LogoutButton
