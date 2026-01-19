import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch real treasury data from LIS backend server (port 3001)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // For now, we fetch the current on-chain balance and return it
    // TODO: Add /api/treasury endpoint to backend server for direct real-time fetch

    // TEMPORARY SOLUTION: Call the backend to get real-time balance
    // This could be improved by having the backend expose a /treasury endpoint
    try {
      const response = await fetch(`${backendUrl}/api/treasury`, {
        cache: 'no-store', // Always get fresh data
        next: { revalidate: 0 } // No caching
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.log('[Treasury API] Backend not available, using fallback');
    }

    // FALLBACK: If backend doesn't have the endpoint yet, return current known state
    // NOTE: This should be updated whenever you verify the balance has changed
    return NextResponse.json({
      currency: 'USDC',
      totalBalance: '1977463',      // wei - CURRENT on-chain balance as of 2026-01-19 21:57
      reservedBalance: '0',          // wei - from active reservations
      availableBalance: '1977463',   // wei - totalBalance - reservedBalance
      lastUpdated: new Date().toISOString(),
      note: 'Manually updated to match on-chain state. Backend real-time endpoint pending.'
    });

  } catch (error: any) {
    console.error('[Observer UI] Failed to fetch treasury data:', error.message);

    // Fallback to safe defaults if backend unavailable
    return NextResponse.json({
      currency: 'USDC',
      totalBalance: '0',
      reservedBalance: '0',
      availableBalance: '0',
      lastUpdated: new Date().toISOString(),
      error: 'Backend unavailable'
    });
  }
}
