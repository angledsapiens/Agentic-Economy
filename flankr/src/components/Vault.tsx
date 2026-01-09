import React from 'react';

export const Vault = () => {
  return (
    <div className="bg-black border border-zinc-800 rounded-lg p-4 w-full mb-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        {/* Decorative Icon or Pattern */}
        <div className="w-16 h-16 bg-white rounded-full blur-2xl"></div>
      </div>

      <h3 className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1 z-10 relative">Treasury</h3>
      <div className="flex items-end gap-1 z-10 relative">
        <span className="text-3xl font-mono text-white font-bold tracking-tighter">$1,250.00</span>
        <span className="text-sm text-zinc-500 mb-1">USDC</span>
      </div>
      <div className="mt-1 text-[10px] text-zinc-600 font-mono">
        Safe Address: 0xTreasury...Safe
      </div>
    </div>
  );
};
