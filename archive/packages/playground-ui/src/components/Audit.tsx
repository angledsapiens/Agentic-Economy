import { useState, useEffect } from 'react';
import { FileCheck, Clock } from 'lucide-react';

interface Receipt {
  id: string;
  description: string;
  timestamp: number;
  amount: string;
  status: 'VERIFIED' | 'PENDING';
}

export default function Audit() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/audits')
      .then(res => res.json())
      .then(setReceipts)
      .catch(() => {
        // Mock data
        setReceipts([
          { id: 'rcpt_001', description: 'Handshake with 0xMock...', timestamp: Date.now(), amount: '1000 USDC', status: 'VERIFIED' }
        ]);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Audit Log</h2>
        <p className="text-slate-400">Immutable record of all liquidity intents and settlements.</p>
      </header>

      <div className="relative border-l-2 border-slate-700 ml-3 space-y-8">
        {receipts.map((rcpt, idx) => (
          <div key={idx} className="relative pl-8">
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${rcpt.status === 'VERIFIED' ? 'bg-green-500 border-slate-900' : 'bg-slate-700 border-slate-800'}`}></div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-green-400" />
                  <span className="font-mono text-sm text-green-400">{rcpt.id}</span>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(rcpt.timestamp).toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{rcpt.description}</h3>
              <div className="text-sm text-slate-400">Settled Amount: <span className="text-white">{rcpt.amount}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
