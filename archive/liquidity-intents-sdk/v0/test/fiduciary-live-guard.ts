import { FiduciaryGuardian, LiquidityIntent, EnvelopeType } from '../dist';
import { v4 as uuidv4 } from 'uuid';

process.env.LIS_MODE = 'TESTNET';

describe('Fiduciary Live Guard', () => {
  let guardian: FiduciaryGuardian;

  beforeAll(() => {
    guardian = new FiduciaryGuardian({
      maxMissionBudget: {
        "USDC": "50"
      },
      blockedProviders: []
    });
  });

  test('Should block excessive Live TESTNET transaction locally', async () => {
    const intent: LiquidityIntent = {
      id: uuidv4(),
      buyer: "0xBuyer...",
      seller: "0xSeller...",
      amount: "1000000",
      asset: {
        symbol: "USDC",
        address: "0x...",
        type: "ERC20",
        chainId: 84532,
        decimals: 6
      },
      envelopeType: EnvelopeType.LIP_TEXT,
      deadline: Date.now() + 3600
    };

    const allowed = guardian.validateIntent(intent);
    expect(allowed).toBe(false);
  });
});
