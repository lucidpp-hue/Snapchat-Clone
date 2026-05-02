import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className='bg-orange-400'>
      <div className='min-h-screen flex flex-col items-center justify-center max-w-7xl mx-auto'>
        <Navbar />
        <main className='flex flex-1 flex-col md:flex-row items-center justify-center px-8 mt-4'>
          <div className='flex-1 md:text-left text-center h-full'>
            <h1 className='text-4xl md:text-6xl font-bold'>PeytOtoria для программистов!</h1>
            <p className='mt-4 text-xl font-semibold'>
              Делитесь кодом с друзьями, получайте обратную связь и улучшайте свой код.
            </p>
            <div className='mt-4'>
              <p className='mt-2 text-lg font-semibold'>Чего вы ждёте?</p>
            </div>
            {!user ? (
              <Button
                asChild
                className='mt-4 bg-black text-white flex items-center rounded-lg gap-2 mx-auto md:mx-0'
              >
                <Link href={"/login"} className='max-w-max'>
                  <Image src='/logo.png' width={20} height={20} alt='Логотип PeytOtoria' className="rounded" />
                  Войти и исследовать
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className='mt-4 bg-black text-white flex items-center rounded-lg gap-2 mx-auto md:mx-0'
              >
                <Link href={"/chat"} className='max-w-max'>
                  <Image src='/logo.png' width={20} height={20} alt='Логотип PeytOtoria' className="rounded" />
                  Начать общение
                </Link>
              </Button>
            )}
          </div>
          <div className='flex-1 md:w-full md:flex'>
            <Image alt='Avatar' width={651} height={621} src='/hero.png' />
          </div>
        </main>
      </div>
    </div>
  );
}
