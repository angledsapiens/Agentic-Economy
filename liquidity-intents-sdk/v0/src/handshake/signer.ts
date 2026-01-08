import { LiquidityIntent } from '../core/intent';
import { Wallet } from 'ethers';
import { VERIFYING_CONTRACT_ADDRESS, DEFAULT_CHAIN_ID } from '../config/env';

export class HandshakeSigner {
  private wallet: Wallet;

  constructor(privateKey: string) {
    this.wallet = new Wallet(privateKey);
  }

  async signIntent(intent: LiquidityIntent, feedbackAuth: boolean = false): Promise<string> {
    const domain = {
      name: 'AgenticEconomy',
      version: '1',
      chainId: DEFAULT_CHAIN_ID, // TODO: Make dynamic based on intent.asset.chainId
      verifyingContract: VERIFYING_CONTRACT_ADDRESS
    };

    const types = {
      AssetProfile: [
        { name: 'type', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'address', type: 'address' },
        { name: 'decimals', type: 'uint8' },
        { name: 'symbol', type: 'string' }
      ],
      LiquidityIntent: [
        { name: 'id', type: 'string' },
        { name: 'buyer', type: 'address' },
        { name: 'seller', type: 'address' },
        { name: 'asset', type: 'AssetProfile' },
        { name: 'amount', type: 'uint256' },
        { name: 'envelopeType', type: 'string' },
        { name: 'deadline', type: 'uint256' },
        { name: 'feedbackAuth', type: 'bool' }
      ]
    };

    // Sanitize values for EIP-712
    const value = {
      ...intent,
      asset: {
        ...intent.asset,
        address: intent.asset.address || '0x0000000000000000000000000000000000000000'
      },
      feedbackAuth
    };

    return this.wallet.signTypedData(domain, types, value);
  }

  getAddress(): string {
    return this.wallet.address;
  }
}
