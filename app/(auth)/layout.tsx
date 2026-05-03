import Image from "next/image";
import Link from "next/link";
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-chat bg-cover bg-center'>
            <div className='p-8 bg-sigMain/90 backdrop-blur-sm rounded-2xl shadow-xl min-w-80 border border-sigColorBgBorder'>
                <Link href={"/"} className='flex justify-center mb-4'>
                    <Image src={"/logo.png"} width={52} height={52} alt='PeytOtoria' />
                </Link>
                {children}
            </div>
        </div>
    )
}

export default AuthLayout
