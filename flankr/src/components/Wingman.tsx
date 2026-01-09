"use client";
import React, { useState } from 'react';
import { Radar } from './Radar';
import { Guardrails } from './Guardrails';
import { Vault } from './Vault';
import { executeStrategyAction } from '@/app/actions';

export const Wingman = () => {
  const [status, setStatus] = useState("ONLINE");
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    setStatus("EXECUTING...");
    const result = await executeStrategyAction();
    setLoading(false);
    setStatus(result.success ? "DEPLOYED" : "FAILED");
    alert(result.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-md w-full border border-zinc-800 bg-zinc-950 rounded-xl shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <h1 className="text-xl font-bold text-white tracking-tight">FLANKR <span className="text-zinc-600 font-normal">v0.1</span></h1>
          </div>
          <div className="px-2 py-1 bg-zinc-900 rounded text-[10px] text-zinc-500 uppercase font-mono">
            Status: {status}
          </div>
        </div>

        {/* Dashboard Grid */}
        <Vault />

        <div className="grid grid-cols-1 gap-2">
          <Guardrails />
          <Radar />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex gap-2">
          {status === "DEPLOYED" ? (
            <a
              href={`https://warpcast.com/~/compose?text=${encodeURIComponent("Just flanked a launch with 0.1% slippage using @flankr. Tactical execution powered by Liquidity Intents SDK. 🛡️⚓")}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => console.log('[Analytics] Share on Warpcast Clicked')}
              className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-colors uppercase text-sm tracking-widest text-center flex items-center justify-center"
            >
              Share on Warpcast 📢
            </a>
          ) : (
            <>
              <button
                onClick={handleDeploy}
                disabled={loading}
                className={`flex-1 ${loading ? 'bg-zinc-700' : 'bg-white hover:bg-zinc-200'} text-black font-bold py-3 rounded-lg transition-colors uppercase text-sm tracking-widest`}
              >
                {loading ? 'deploying...' : 'Deploy Asset'}
              </button>
              <button className="flex-1 bg-zinc-900 text-white font-bold py-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors uppercase text-sm tracking-widest">
                Scan
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-8 text-center">
        <a
          href="https://github.com/angledsapiens/Agentic-Economy"
          target="_blank"
          rel="noreferrer"
          onClick={() => console.log('[Analytics] Powered By LIS Clicked')}
          className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
        >
          Powered by Liquidity Intents SDK 🛡️
        </a>
      </div>
    </div>
  );
};
