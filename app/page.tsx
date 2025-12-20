import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f4e9ce] relative">
      <div className="absolute inset-0 bg-[#00000088] z-0"></div>
      <Image
        src="/logo2.jpg"
        alt="Sénégal Livres"
        width={500}
        height={500}
        priority
        className="opacity-20 w-full h-[350px] md:h-[450px] object-contain mx-auto z-0"
      />
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-2 py-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg text-center">
          Bienvenue sur Sénégal Livres
        </h1>
        <div className="bg-white/90 rounded-lg p-4 md:p-8 w-full max-w-3xl text-gray-900 text-base md:text-lg shadow-xl text-center mb-6">
          <p className="mb-4">
            Tout a commencé par une passion : celle des livres.<br />
            Dans un monde où l’on court après le temps, beaucoup n’arrivent plus à trouver l’espace pour flâner dans une librairie, sentir l’odeur des pages et découvrir une histoire qui change une vie. C’est là qu’est née <b>Sénégal Livres</b>, avec une idée simple : rendre le livre accessible partout, à tout moment, en un clic.
          </p>
          <p className="mb-4">
            Nous croyons que chaque livre est une rencontre. Derrière chaque couverture se cache une émotion, une leçon, une aventure. Notre mission est de permettre à chacun – étudiant, passionné, professionnel ou simple curieux – de trouver l’ouvrage qui lui parle, sans contrainte.
          </p>
          <p className="mb-4">
            Notre boutique en ligne n’est pas qu’un catalogue, c’est un pont entre les auteurs et les lecteurs. Nous sélectionnons des livres qui inspirent, qui instruisent et qui divertissent. Nous voulons redonner au livre sa place dans la vie quotidienne, en le rendant plus proche, plus accessible, plus moderne.
          </p>
          <p className="mb-4">
            Parce que lire, c’est grandir. Lire, c’est s’évader. Lire, c’est se construire.
          </p>
          <p className="mb-4 font-semibold">
            Et si le prochain livre qui va changer ta vie était déjà chez nous, prêt à rejoindre ta bibliothèque ?
          </p>
          <p className="mt-4 text-base text-gray-700">
            <b>Livraison partout sur Dakar</b> pour toute commande en ligne.<br />
            <b>Si tu achètes en ligne</b>, tu reçois aussi la version PDF du livre immédiatement après paiement !
          </p>
        </div>
        <Link
          href="/books"
          className="w-full max-w-xs md:max-w-sm px-6 py-3 bg-[#128A41] text-white rounded-lg shadow-lg hover:bg-black text-lg font-semibold mx-auto"
        >
          Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
