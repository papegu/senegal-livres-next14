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
          <div className="mb-6 flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-green-700 mb-2">77 713 17 31</span>
            <div className="flex gap-4 mt-2">
              <a href="https://www.facebook.com/share/1DhysVYbYN/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="32" height="32" fill="currentColor" className="text-blue-600 hover:text-blue-800" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a href="https://x.com/serignebabacargueye" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <svg width="32" height="32" fill="currentColor" className="text-black hover:text-gray-700" viewBox="0 0 24 24"><path d="M22.162 0H1.838C.822 0 0 .822 0 1.838v20.324C0 23.178.822 24 1.838 24h20.324A1.84 1.84 0 0 0 24 22.162V1.838A1.84 1.84 0 0 0 22.162 0zM7.19 20.452H3.548V9.048H7.19v11.404zm-1.821-13.01a2.09 2.09 0 1 1 0-4.18 2.09 2.09 0 0 1 0 4.18zm15.083 13.01h-3.642v-5.604c0-1.336-.025-3.057-1.864-3.057-1.864 0-2.15 1.454-2.15 2.956v5.705h-3.642V9.048h3.497v1.561h.05c.487-.922 1.677-1.894 3.453-1.894 3.693 0 4.373 2.43 4.373 5.59v6.147z"/></svg>
              </a>
              <a href="https://www.instagram.com/senegal_livres_?igsh=eXV0N3RmanJzNGxm&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="32" height="32" fill="currentColor" className="text-pink-600 hover:text-pink-800" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.414 3.678 1.395c-.98.98-1.263 2.092-1.322 3.373C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.342 2.393 1.322 3.373.981.981 2.093 1.264 3.374 1.323C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.342 3.373-1.323.981-.98 1.264-2.092 1.323-3.373.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.342-2.393-1.323-3.373-.98-.981-2.092-1.264-3.373-1.323C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="https://wa.me/221777131731" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="32" height="32" fill="currentColor" className="text-green-600 hover:text-green-800" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.26-1.64A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.22-3.72.98.99-3.62-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43 0 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/s%C3%A9n%C3%A9gal-livres-1a059619a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="32" height="32" fill="currentColor" className="text-blue-700 hover:text-blue-900" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76c.97 0 1.75.79 1.75 1.76s-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@senegal.livres?_r=1&_t=ZM-92OSXJSm9rU" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="32" height="32" fill="currentColor" className="text-black hover:text-gray-700" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25c.124 0 .246.012.366.03V12.5a4.75 4.75 0 1 0 4.75 4.75V7.5c.73.44 1.58.7 2.5.7V6.25c-.62 0-1.19-.19-1.67-.51A2.75 2.75 0 0 1 15.25 3.5V2h-2.5z"/></svg>
              </a>
            </div>
          </div>
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
      </div>
    </div>
  );
}
