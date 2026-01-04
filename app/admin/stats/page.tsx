import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { verifyJwt } from "@/utils/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

async function isAdminServer(): Promise<boolean> {
  try {
    const cookie = cookies().get("auth_token")?.value;
    if (!cookie) return false;
    const payload = await verifyJwt(cookie).catch(() => null);
    return !!(payload && payload.role === "admin");
  } catch {
    return false;
  }
}

async function getStats() {
  const [transactions, booksCount] = await Promise.all([
    prisma.transaction.findMany(),
    prisma.book.count(),
  ]);

  const stats = {
    successTransactions: transactions.filter((t: any) => t.status === "validated").length,
    pendingTransactions: transactions.filter((t: any) => t.status === "pending").length,
    cancelledTransactions: transactions.filter((t: any) => t.status === "cancelled").length,
    totalRevenue: transactions
      .filter((t: any) => t.status === "validated")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0),
    totalBooks: booksCount,
  };

  let adminStatsRow: any = null;
  try {
    const { data } = await supabase
      .from("adminstats")
      .select("*")
      .limit(1);
    adminStatsRow = (data && data[0]) || null;
  } catch {}

  return { stats, adminStatsRow };
}

export default async function AdminStatsSSRPage() {
  const isAdmin = await isAdminServer();
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[#C0392B] mb-4">Unauthorized</h1>
          <p className="text-gray-700 mb-4">You must be an admin to view stats.</p>
          <Link href="/auth/login" className="text-[#128A41] font-semibold hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  const { stats, adminStatsRow } = await getStats();

  return (
    <div className="min-h-screen bg-[#F4E9CE]">
      <nav className="bg-[#C0392B] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Admin Stats (SSR)</h1>
          <Link href="/admin" className="bg-gray-100 text-[#C0392B] px-4 py-2 rounded hover:bg-gray-200 font-semibold">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Successful Transactions</p>
            <p className="text-4xl font-bold text-green-600">{stats.successTransactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Pending Transactions</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Cancelled Transactions</p>
            <p className="text-4xl font-bold text-red-600">{stats.cancelledTransactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-4xl font-bold text-[#128A41]">{stats.totalRevenue.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Supabase Admin Stats</h2>
          {adminStatsRow ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Total Books (Supabase)</p>
                <p className="text-3xl font-bold text-[#128A41]">{adminStatsRow.total_books ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Visits</p>
                <p className="text-3xl font-bold text-blue-600">{adminStatsRow.total_visits ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Last Update</p>
                <p className="text-lg font-semibold text-gray-800">{adminStatsRow.last_update ?? '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">No adminstats row found in Supabase.</p>
          )}
        </div>

        <div className="mt-8">
          <Link href="/admin" className="text-[#128A41] hover:underline font-semibold">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
