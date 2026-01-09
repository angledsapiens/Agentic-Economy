import React from 'react';

export const Radar = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full mb-4">
      <h3 className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-2">Radar</h3>
      <div className="flex items-center justify-between bg-zinc-800 p-2 rounded">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-white">Scanning Sector...</span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">0 Targets</span>
      </div>

      {/* Mock Target */}
      <div className="mt-2 flex items-center justify-between bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
        <div className="flex flex-col">
          <span className="text-sm font-mono text-zinc-300">0x...FakeTarget</span>
          <span className="text-[10px] text-zinc-600 font-mono">LIP_CHAOS_TEST</span>
        </div>
        <div className="px-2 py-1 bg-red-900/30 border border-red-500/20 rounded text-[10px] text-red-400">
          THREAT: 80%
        </div>
      </div>
    </div>
  );
};
