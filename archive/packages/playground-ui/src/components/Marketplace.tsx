import { useState, useEffect } from 'react';
import { Search, Zap } from 'lucide-react';

interface Agent {
  did: string;
  capabilities: string[];
  reputation: number;
  minPrice?: string;
}

export default function Marketplace() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiring, setHiring] = useState<string | null>(null);

  // Mock fetch for now, will connect to server later
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/agents?capability=LIP_TEXT');
      const data = await res.json();
      setAgents(data);
    } catch (e) {
      console.error("Failed to fetch agents", e);
      // Fallback mock
      setAgents([
        { did: 'did:pkh:0xMockSeller...', capabilities: ['LIP_TEXT'], reputation: 95, minPrice: '1000' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (did: string) => {
    setHiring(did);
    try {
      await fetch('http://localhost:3000/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerDid: did, amount: '1000' })
      });
      alert(`Handshake initiated with ${did}`);
    } catch (e) {
      alert("Failed to initiate handshake");
    } finally {
      setHiring(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Agent Marketplace</h2>
        <p className="text-slate-400">Discover and hire liquidity agents on the Yellow Pages Registry.</p>
      </header>

      <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by capability (e.g. LIP_TEXT)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => (
          <div key={agent.did} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between hover:border-blue-500/50 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-mono text-lg font-semibold text-blue-300">{agent.did.substring(0, 16)}...</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">Rep: {agent.reputation}</span>
              </div>
              <div className="flex gap-2">
                {agent.capabilities.map(cap => (
                  <span key={cap} className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{cap}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleHire(agent.did)}
              disabled={!!hiring}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              {hiring === agent.did ? 'Negotiating...' : 'Hire Agent'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
