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
        <header className="w-full py-4 px-8 flex justify-between items-center">
            <Link href="/">
                <Image src="/logo.png" width={40} height={40} alt="PeytOtoria" className="cursor-pointer rounded-xl" />
            </Link>
            <nav className="flex space-x-1">
                <Button asChild className="bg-transparent hover:bg-primary/5 text-black font-semibold shadow-none">
                    <Link href="/chat">Чаты</Link>
                </Button>
                {user && (
                    <Button asChild className="bg-transparent hover:bg-primary/5 text-black font-semibold shadow-none">
                        <Link href={`/profile/${user.id}`}>Профиль</Link>
                    </Button>
                )}
            </nav>
            <div className="flex space-x-2">
                {!user && (
                    <>
                        <Button asChild className="bg-black text-white rounded-full px-5 text-sm">
                            <Link href="/login">Войти</Link>
                        </Button>
                        <Button asChild className="bg-orange-500 hover:bg-orange-400 text-white rounded-full px-5 text-sm">
                            <Link href="/signup">Регистрация</Link>
                        </Button>
                    </>
                )}
                {user && <LogoutButton />}
            </div>
        </header>
    );
};
export default Navbar;
