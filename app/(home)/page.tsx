import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="bg-orange-400 min-h-screen flex flex-col">
      <Navbar />

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="flex flex-col items-center gap-6 max-w-xl">
          <Image src="/logo.png" width={96} height={96} alt="PeytOtoria" className="rounded-2xl shadow-lg" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black">PeytOtoria</h1>
          <p className="text-lg font-medium text-black/80 leading-relaxed">
            Общайтесь с друзьями, делитесь историями и оставайтесь на связи.
          </p>
          <div className="flex gap-3 mt-2">
            <Button asChild className="bg-black text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-gray-900">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="bg-white text-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-gray-100">
              <Link href="/signup">Зарегистрироваться</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Features section */}
      <section className="bg-black text-white py-20 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="text-4xl mb-3 font-bold text-orange-400">01</div>
            <h3 className="text-lg font-bold mb-2">Мгновенные чаты</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Пишите сообщения в реальном времени, делитесь фото и видео.</p>
          </div>
          <div>
            <div className="text-4xl mb-3 font-bold text-orange-400">02</div>
            <h3 className="text-lg font-bold mb-2">Истории</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Публикуйте истории, которые исчезают через 24 часа.</p>
          </div>
          <div>
            <div className="text-4xl mb-3 font-bold text-orange-400">03</div>
            <h3 className="text-lg font-bold mb-2">Профили</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Настройте профиль, набирайте подписчиков и находите друзей.</p>
          </div>
        </div>
      </section>

      {/* Denmark footer section */}
      <section className="bg-orange-500 py-14 px-8 text-center">
        <p className="text-black font-semibold text-sm uppercase tracking-widest mb-1">Сделано с любовью</p>
        <h2 className="text-3xl md:text-4xl font-bold text-black">Основано в Дании</h2>
        <p className="text-black/70 mt-2 text-sm">Copenhagen, Denmark &mdash; 🇩🇰</p>
      </section>
    </div>
  );
}
