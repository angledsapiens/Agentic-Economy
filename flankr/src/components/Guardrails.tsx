import React from 'react';

export const Guardrails = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full mb-4">
      <h3 className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-2">Fiduciary Guard</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-800 p-2 rounded border-l-2 border-green-500">
          <span className="block text-[10px] text-zinc-500">Max Transaction</span>
          <span className="text-sm font-mono text-white font-bold">$50.00 USDC</span>
        </div>
        <div className="bg-zinc-800 p-2 rounded border-l-2 border-orange-500">
          <span className="block text-[10px] text-zinc-500">Global Rate</span>
          <span className="text-sm font-mono text-white font-bold">5 / hr</span>
        </div>
      </div>
    </div>
  );
};
