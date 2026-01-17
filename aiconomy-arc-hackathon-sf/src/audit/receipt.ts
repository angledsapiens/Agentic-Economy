import { ethers } from 'ethers';
import { LiquidityIntent } from '../core/intent';
import { v4 as uuidv4 } from 'uuid';

export interface AuditReceipt {
  missionId: string;
  intentHash: string;
  settlementTx: string;
  deliveryArtifactHash: string;
  timestamp: number;
}

export class ReceiptGenerator {
  private signer: ethers.Wallet;
  private domain = {
    name: 'AgenticEconomyAudit',
    version: '1',
    chainId: 1, // Default, should be configurable
    verifyingContract: '0x0000000000000000000000000000000000000000'
  };

  private types = {
    AuditReceipt: [
      { name: 'missionId', type: 'string' },
      { name: 'intentHash', type: 'string' },
      { name: 'settlementTx', type: 'string' },
      { name: 'deliveryArtifactHash', type: 'string' },
      { name: 'timestamp', type: 'uint256' }
    ]
  };

  constructor(privateKey: string) {
    this.signer = new ethers.Wallet(privateKey);
  }

  async generateReceipt(
    intent: LiquidityIntent,
    settlementTx: string,
    deliveryArtifactHash: string
  ): Promise<{ receipt: AuditReceipt, signature: string }> {

    const receipt: AuditReceipt = {
      missionId: uuidv4(),
      intentHash: ethers.id(JSON.stringify(intent)), // Simplification for v0
      settlementTx: settlementTx,
      deliveryArtifactHash: deliveryArtifactHash,
      timestamp: Date.now()
    };

    const signature = await this.signer.signTypedData(this.domain, this.types, receipt);

    return { receipt, signature };
  }
}
