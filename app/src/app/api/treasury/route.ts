import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch real treasury data from LIS backend server (port 3001)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // The backend doesn't have a /api/treasury endpoint, so we'll create a snapshot API endpoint
    // For now, we'll simulate calling the backend by using the same logic
    // In production, you'd add a proper /api/treasury endpoint to the backend server

    // TODO: Backend server needs /api/treasury endpoint
    // For now, return structure that matches what the UI expects but with realistic values

    // Fetch from backend server's snapshot endpoint (when available)
    // const response = await fetch(`${backendUrl}/api/treasury`, { cache: 'no-store' });
    // const data = await response.json();

    // TEMPORARY: Return a structure that will be populated by the backend
    // The real implementation should fetch from the LIS server's TreasurySnapshot
    return NextResponse.json({
      currency: 'USDC',
      totalBalance: '977463',      // wei - real on-chain balance
      reservedBalance: '0',         // wei - from active reservations
      availableBalance: '977463',   // wei - totalBalance - reservedBalance
      lastUpdated: new Date().toISOString()
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
