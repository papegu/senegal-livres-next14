export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./CheckoutForm";

type Params = { params: { id: string } };

export default async function BookPage({ params }: Params) {
  const whereClause = Number.isNaN(Number(params.id))
    ? { uuid: params.id }
    : { id: Number(params.id) };

  const book = await prisma.book.findUnique({ where: whereClause });

  if (!book) {
    return (
      <div className="p-10">
        <h1>Livre introuvable</h1>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#F4E9CE] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img src={book.coverImage} alt={book.title} className="w-full md:w-1/3 object-cover h-72" />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#C0392B]">{book.title}</h1>
            <p className="text-sm text-gray-600">{book.author}</p>
            <p className="mt-4 font-semibold text-[#128A41]">{book.price} FCFA</p>
            <p className="mt-4">{book.description || "Aucune description."}</p>

            <CheckoutForm bookId={String(book.id)} price={book.price} />
          </div>
        </div>
      </div>
    </div>
  );
}
