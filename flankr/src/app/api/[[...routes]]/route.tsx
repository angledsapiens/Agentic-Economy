/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from 'frog';
import { handle } from 'frog/next';

type State = {
  targetPrice: string;
  slippage: string;
}

const app = new Frog<{ State: State }>({
  basePath: '/api',
  title: 'Flankr Frame',
  initialState: {
    targetPrice: '0',
    slippage: '0.5'
  },
  dev: {
    enabled: true
  }
});

console.log('🐸 Flankr Frame Initialized');

// 1. Initial Frame
app.frame('/', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60, backgroundColor: 'black', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Flankr
        <div style={{ fontSize: 30, marginTop: 20 }}>Liquidity Intents SDK</div>
      </div>
    ),
    intents: [
      <Button action="/price">Enter Guard</Button>,
    ],
  })
});

// 2. Price Input Frame
app.frame('/price', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, backgroundColor: '#18181b', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Step 1: Target Price
        <div style={{ fontSize: 20, marginTop: 10, color: '#a1a1aa' }}>Enter target ETH price</div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Message..." />, // using 'Message' as placeholder for Price due to generic input
      <Button action="/slippage">Next</Button>,
    ],
  })
});

// 3. Slippage Input Frame
app.frame('/slippage', (c) => {
  const { deriveState } = c;
  const state = deriveState(previousState => {
    if (c.inputText) previousState.targetPrice = c.inputText;
  });

  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, backgroundColor: '#18181b', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Step 2: Max Slippage
        <div style={{ fontSize: 20, marginTop: 10, color: '#a1a1aa' }}>Target: ${state.targetPrice}</div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Slippage % (e.g. 0.5)" />,
      <Button action="/vault">Finalize Flank</Button>,
    ],
  })
});

// 4. Vault (Review) Frame
app.frame('/vault', (c) => {
  const { deriveState } = c;
  const state = deriveState(previousState => {
    if (c.inputText) previousState.slippage = c.inputText;
  });

  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, backgroundColor: '#18181b', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Tactical Vault
        <div style={{ fontSize: 24, marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>Target: ${state.targetPrice}</div>
          <div>Slippage: {state.slippage}%</div>
          <div style={{ marginTop: 10, color: '#4ade80' }}>Ready to Deploy</div>
        </div>
      </div>
    ),
    intents: [
      <Button action="/price">Edit</Button>,
      <Button.Transaction target="/tx">Deploy Asset</Button.Transaction>
    ],
  })
});

// Transaction Handler
app.transaction('/tx', async (c) => {
  const { previousState } = c;
  // TODO: Call contract or just return success for Phase 19?
  // Since we are mocking the "Lock Funds" via Server Action in the Web UI,
  // for the Frame we technically need an On-Chain Transaction or a "Success" frame if we are just simulating.
  // Frog transaction expects a contract call.
  // For this "Signal" phase, we might just simulate a "Success" frame directly if we aren't actually minting an intent on chain via the frame yet.
  // However, the prompt says "Update executeStrategyAction... to accept dynamic inputs".
  // Frame Transactions MUST return eth transaction data.
  // IF we want to use the Server Action `executeStrategyAction`, we can't do it inside `app.transaction`.
  // `app.transaction` is for user wallet signatures.
  // `app.frame` can do server actions.

  // Pivot: Let's use a standard Button action that calls a frame which calls the server action internally?
  // Frames can't natively "call server action" without a signature unless we just log it.
  // For real settlement, the USER needs to sign.
  // "The Signal" phase implies we might just be showing the "Success" state.

  // Start with a mock transaction for Base Sepolia (sending 0 ETH to self) to prove the flow?
  // OR just skip to success frame for the demo if we aren't doing real on-chain interactions yet.

  // Re-reading: "Verify that the LIS solver correctly interprets these... inputs".
  // "Integration: On the final 'Vault' screen... display inputs...".

  // Let's return a dummy transaction to self to simulate "Deploying".
  const erc20Abi = [
    {
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const;

  return c.contract({
    abi: erc20Abi,
    chainId: 'eip155:84532',
    functionName: 'approve',
    args: ['0x0000000000000000000000000000000000000000', BigInt(0)],
    to: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC Address (or dummy)
    value: BigInt(0),
  })
});

app.frame('/finish', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60, backgroundColor: 'black', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Deployed! 🚀
        <div style={{ fontSize: 24, marginTop: 20 }}>Wingman Active</div>
      </div>
    ),
    intents: [
      <Button.Link href={`https://warpcast.com/~/compose?text=${encodeURIComponent("Just flanked a launch! 🛡️")}`}>Share</Button.Link>
    ],
  })
});

export const GET = handle(app);
export const POST = handle(app);
