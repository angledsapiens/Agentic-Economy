import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Gauge } from './Gauge';

// Shim vscode API
declare const acquireVsCodeApi: () => any;
const rootEl = document.getElementById('root');
if (rootEl) rootEl.innerText = "Script Loaded... Initializing React...";

const vscode = acquireVsCodeApi();

interface TreasuryStatus {
  balance: number;
  maxBalance: number;
  totalSpent: number;
  budget: number;
  burnRate: number;
  isLocked: boolean;
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [demoState, setDemoState] = useState<'idle' | 'simulating' | 'requested' | 'processing' | 'complete'>('idle');
  const [receipt, setReceipt] = useState<any>(null);

  const [status, setStatus] = useState<TreasuryStatus>({
    balance: 0,
    maxBalance: 5,
    totalSpent: 0,
    budget: 0.1,
    burnRate: 0,
    isLocked: false
  });

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'update') {
        setStatus(message.data);
        setIsLoading(false);
      }
      if (message.type === 'demoComplete') {
        setReceipt(message.data);
        setDemoState('complete');
      }
      if (message.type === 'demoError') {
        setDemoState('idle'); // Reset on error
      }
    });
  }, []);

  // Auto-redirect on complete
  useEffect(() => {
    if (demoState === 'complete') {
      const timer = setTimeout(() => {
        setDemoState('idle');
        handleSync();
      }, 3000); // 3 seconds to read the receipt
      return () => clearTimeout(timer);
    }
  }, [demoState]);

  const handleUnlock = () => {
    vscode.postMessage({ type: "removeLock" });
  };

  const handleSync = () => {
    setIsLoading(true);
    vscode.postMessage({ type: 'onInfo', value: 'Syncing Ledger...' });
  };

  const handleKillSwitch = () => {
    vscode.postMessage({ type: 'killSwitch', value: true });
  };

  const handleSimulate = () => {
    setDemoState('simulating');

    // 1. Simulate Incoming Request (2s)
    setTimeout(() => {
      setDemoState('requested');

      // 2. Auto-Transition to Processing (Guardrail Check) (2s)
      setTimeout(() => {
        setDemoState('processing');
        vscode.postMessage({ type: 'approveDemo' });
      }, 2500);

    }, 2000);
  };

  if (status.isLocked) {
    return (
      <div className="locked-screen">
        <h1>⛔ SYSTEM LOCKED</h1>
        <p>Signing Authority Revoked</p>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleUnlock}
            style={{ background: '#4CAF50', color: 'white', fontWeight: 'bold', padding: '10px', border: 'none', cursor: 'pointer' }}
          >
            🔐 UNLOCK TREASURY
          </button>
          <p style={{ fontSize: '10px', marginTop: '10px', opacity: 0.7 }}>
            (Deletes STOP.LOCK file)
          </p>
        </div>
      </div>
    );
  }

  // DEMO OVERLAYS
  if (demoState === 'requested') {
    return (
      <div className="card" style={{ padding: '20px', borderLeft: '4px solid #00BCD4', animation: 'pulse 1s infinite' }}>
        <h3 style={{ margin: 0, color: '#00BCD4' }}>⚡ Incoming Request</h3>
        <p style={{ margin: '10px 0' }}><strong>Agent:</strong> Security Auditor</p>
        <p style={{ margin: '5px 0' }}><strong>Amount:</strong> 0.01 USDC</p>
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '11px' }}>🔍 Checking Guardrails...</p>
          <p style={{ margin: '5px 0 0 0', color: '#4CAF50', fontWeight: 'bold', fontSize: '11px' }}>✓ Budget OK ( &lt; 0.10 )</p>
          <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold', fontSize: '11px' }}>✓ Trust Score OK</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px', opacity: 0.8 }}>Auto-Approving...</p>
      </div>
    );
  }

  if (demoState === 'processing') {
    return (
      <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
        <h3>🔄 Processing...</h3>
        <p>Broadcasting to Base Sepolia</p>
      </div>
    );
  }

  if (demoState === 'complete' && receipt) {
    return (
      <div className="card" style={{ padding: '20px', borderLeft: '4px solid #4CAF50' }}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>✅ Receipt</h3>
        <div style={{ fontSize: '11px', marginTop: '10px', wordBreak: 'break-all' }}>
          <p><strong>To:</strong> {receipt.recipient}</p>
          <p><strong>Amount:</strong> {receipt.amount} USDC</p>
          <p><strong>Tx:</strong> {receipt.txId.substring(0, 16)}...</p>
        </div>
        <p style={{ marginTop: '15px', fontSize: '10px', opacity: 0.7, fontStyle: 'italic', textAlign: 'center' }}>
          Redirecting to Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', color: 'var(--vscode-foreground)' }}>
      <h2 style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', opacity: 0.8 }}>Mission Control</h2>

      <div className="card" style={{ marginTop: '20px', marginBottom: '20px' }}>
        {status.balance === -1 ? (
          <div style={{ textAlign: 'center', color: '#f44336', padding: '10px' }}>
            <p style={{ fontWeight: 'bold' }}>⚠️ AUTH FAILED</p>
            <p style={{ fontSize: '10px' }}>Missing .env Credentials</p>
          </div>
        ) : (
          <>
            <Gauge value={status.balance} max={5.0} isLoading={isLoading || demoState === 'simulating'} />
            {demoState === 'simulating' && <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '5px' }}>Simulating Traffic...</p>}
          </>
        )}
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="stat-box">
          <label>Burn Rate</label>
          <div className="value">{status.burnRate.toFixed(3)}/hr</div>
        </div>
        <div className="stat-box">
          <label>Budget</label>
          <div className="value">{(status.totalSpent / status.budget * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="actions" style={{ marginTop: '30px' }}>
        <button
          style={{
            background: 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-secondaryForeground)',
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleSync}
        >
          🔄 Sync Ledger
        </button>

        <button
          style={{
            background: 'transparent',
            border: '1px solid var(--vscode-descriptionForeground)',
            color: 'var(--vscode-descriptionForeground)',
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          onClick={handleSimulate}
          disabled={demoState !== 'idle'}
        >
          ⚡ Simulate Agent Request
        </button>

        <button
          className="critical-stop"
          style={{
            background: '#d32f2f',
            color: 'white',
            width: '100%',
            padding: '15px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
          onClick={handleKillSwitch}
        >
          🚨 CRITICAL STOP
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: any }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
          <h3>💥 UI Crash</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
            {this.state.error?.message}
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()}>Reload UI</button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (e: any) {
  const errDiv = document.createElement('div');
  errDiv.style.color = 'red';
  errDiv.style.padding = '20px';
  errDiv.innerHTML = `<h2>REACT ROOT CRASH</h2><pre>${e.message}\n${e.stack}</pre>`;
  document.body.appendChild(errDiv);
}
