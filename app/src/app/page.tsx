'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [treasury, setTreasury] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(setProfile);
    fetch('/api/treasury').then(res => res.json()).then(setTreasury);
    fetch('/api/activity').then(res => res.json()).then(setActivity);
  }, []);

  if (!profile || !treasury || !activity) return <div className="p-10 text-center">Initializing Observer Link...</div>;

  return (
    <div className="min-h-screen p-8 text-gray-200">
      <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">LIS Observer</h1>
          <p className="text-sm text-gray-500">Autonomous Commerce Dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-500 font-bold">● SYSTEM ONLINE</div>
          <div className="text-xs text-gray-600">v1.0.0-beta</div>
        </div>
      </header>

      <div className="bg-gray-800/30 rounded-lg p-3 mb-8 text-sm text-gray-400 border border-gray-800/50">
        This dashboard shows a live autonomous agent performing ERC-8004 discovery and x402 per-request payments, supervised via LIS.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* IDENTITY */}
        <div className="card">
          <div className="label">Agent Identity</div>
          <div className="value text-white">{profile.identity?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-400 mt-1">{profile.identity?.id}</div>
          <div className="mt-4 flex gap-2">
            <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded">ERC-8004 Registered</span>
          </div>
        </div>

        {/* FINANCIALS */}
        <div className="card">
          <div className="label">Treasury ({treasury.currency})</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-bold text-white">${treasury.availableBalance}</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-yellow-500 font-mono">${treasury.reservedBalance}</div>
              <div className="text-xs text-gray-500">Locked</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-600 leading-tight">
            Source: LIS Treasury Snapshot (Local Reservation State). Settlement occurs on testnet via the configured Settlement Provider.
          </div>
        </div>

        {/* POLICY */}
        <div className="card col-span-2">
          <div className="label">Fiduciary Policy</div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-xs text-gray-500">Daily Spend Limit</div>
              <div className="text-lg text-white">${profile.policy?.dailyLimit} USDC</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Global Limit</div>
              <div className="text-lg text-white">${profile.policy?.globalLimit} USDC</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Approval Threshold</div>
              <div className="text-lg text-white">${profile.policy?.approvalThreshold} USDC</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Manager Mode</div>
              <div className="text-lg text-green-400">Autonomous</div>
            </div>
          </div>
        </div>
      </div>

      {/* TERMINAL */}
      <div className="card bg-black font-mono text-xs overflow-hidden flex flex-col h-[500px]">
        <div className="flex justify-between border-b border-gray-800 pb-2 mb-2">
          <span className="text-gray-400">Activity Log</span>
          <span className="text-gray-600">TESTNET_EXECUTION_LOG.md</span>
        </div>
        <pre className="flex-1 overflow-auto text-green-500/80 whitespace-pre-wrap">
          {activity.logs || 'No activity detected.'}
        </pre>
      </div>
    </div>
  );
}
