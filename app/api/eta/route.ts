import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { lat, lon } = await req.json();
    // Coordonnées approximatives de Dakar
    const dakar = { lat: 14.6937, lon: -17.4441 };

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    let etaMinutes = 120;

    if (typeof lat === 'number' && typeof lon === 'number') {
      const dLat = toRad(lat - dakar.lat);
      const dLon = toRad(lon - dakar.lon);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(dakar.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = R * c;
      etaMinutes = distKm <= 10 ? 30 : distKm <= 50 ? 90 : 180;
      return NextResponse.json({ ok: true, distKm, etaMinutes });
    }

    return NextResponse.json({ ok: true, etaMinutes, note: 'Location missing; default ETA used' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    example: {
      lat: 14.72,
      lon: -17.46,
    },
    usage: 'POST /api/eta with { lat, lon } returns distKm and etaMinutes',
  });
}