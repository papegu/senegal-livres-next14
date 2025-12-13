import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 bg-[#00000088] z-10"></div>

        <Image
          src="/logo2.jpg"
          alt="Sénégal Livres"
          width={500}
          height={500}
          priority
          className="opacity-20 w-full h-[450px] object-contain mx-auto"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg text-center">
            Bienvenue sur Sénégal Livres
          </h1>

          <p className="text-xl text-white mb-6 text-center">
            La première librairie numérique 100% sénégalaise 🇸🇳
          </p>

          <Link
            href="/books"
            className="px-6 py-3 bg-[#128A41] text-white rounded-lg shadow-lg hover:bg-black text-lg"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
