import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import LogoutButton from "./logout-button";
import { createClient } from "@/lib/supabase/server";

const Navbar = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className='w-full py-4 px-8 flex justify-between items-center'>
            <Image src='/logo.svg' width={40} height={40} alt='Snapchat logo' className='cursor-pointer' />
            <div className='flex space-x-1'>
                <Button className='bg-transparent hover:bg-primary/5 text-black'>Stories</Button>
                <Button className='bg-transparent hover:bg-primary/5 text-black'>Spotlight</Button>
                <Button asChild className='bg-transparent hover:bg-primary/5 text-black'>
                    <Link href={"/chat"}>Chat</Link>
                </Button>
            </div>
            <div className='flex space-x-2'>
                <Button className='bg-black text-white rounded-full p-3 text-xs md:text-sm'>Download</Button>
                {!user && (
                    <Button asChild className='bg-black text-white rounded-full p-3 text-xs md:text-sm'>
                        <Link href={"/login"}>Login</Link>
                    </Button>
                )}
                {user && <LogoutButton />}
            </div>
        </header>
    );
};
export default Navbar;
