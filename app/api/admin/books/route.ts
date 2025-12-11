import { readDB, writeDB } from "@/utils/fileDb";
import { v4 as uuidv4 } from "uuid";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

async function isAdmin(req: Request): Promise<boolean> {
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) return true;

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    console.log("[isAdmin] No cookie header found");
    return false;
  }

  const token = getCookie(cookieHeader, 'auth_token');
  if (!token) {
    console.log("[isAdmin] No auth_token cookie found");
    return false;
  }

  const payload = await verifyJwt(token).catch(err => {
    console.log("[isAdmin] JWT verification failed:", err);
    return null;
  });
  
  const result = !!(payload && payload.role === 'admin');
  console.log("[isAdmin books] JWT role:", payload?.role, "Result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    const db = await readDB();
    const books = db.books || [];
    return Response.json({ ok: true, books });
  } catch (error) {
    console.error("GET /api/admin/books error:", error);
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, author, price, description, coverImage, status, eBook } = await req.json();

    if (!title || !author || price === undefined || !coverImage) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await readDB();
    const newBook = {
      id: uuidv4(),
      title,
      author,
      price: Number(price),
      description: description || "",
      coverImage,
      status: status || "available",
      eBook: eBook === true,
    };

    db.books = db.books || [];
    db.books.push(newBook);
    await writeDB(db);

    return Response.json({ ok: true, book: newBook }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/books error:", error);
    return Response.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, title, author, price, description, coverImage, status, eBook } = await req.json();

    if (!bookId) {
      return Response.json({ error: "Missing bookId" }, { status: 400 });
    }

    const db = await readDB();
    const book = (db.books || []).find((b: any) => b.id === bookId);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Update only provided fields
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (price !== undefined) book.price = Number(price);
    if (description !== undefined) book.description = description;
    if (coverImage !== undefined) book.coverImage = coverImage;
    if (status !== undefined) book.status = status;
    if (typeof eBook === 'boolean') book.eBook = eBook;

    await writeDB(db);

    return Response.json({ ok: true, book });
  } catch (error) {
    console.error("PUT /api/admin/books error:", error);
    return Response.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const bookId = url.searchParams.get("id");

    if (!bookId) {
      return Response.json({ error: "Missing book id" }, { status: 400 });
    }

    const db = await readDB();
    const initialLength = (db.books || []).length;
    db.books = (db.books || []).filter((b: any) => b.id !== bookId);

    if (db.books.length === initialLength) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    await writeDB(db);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/books error:", error);
    return Response.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
