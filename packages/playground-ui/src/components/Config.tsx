import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function Config() {
  const [policy, setPolicy] = useState('{\n  "maxMissionBudget": {\n    "USDC": 5000\n  }\n}');

  useEffect(() => {
    // Mock fetch
    fetch('http://localhost:3000/config')
      .then(res => res.json())
      .then(data => setPolicy(JSON.stringify(data, null, 2)))
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    try {
      await fetch('http://localhost:3000/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: policy
      });
      alert("Policy successfully updated!");
    } catch {
      alert("Failed to save policy.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Fiduciary Policy</h2>
        <p className="text-slate-400">Configure budget caps and operational guardrails.</p>
      </header>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <span className="font-mono text-sm text-slate-400">Policy.json</span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
        <textarea
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
          className="w-full h-96 bg-slate-800 p-6 font-mono text-sm text-blue-300 focus:outline-none resize-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
