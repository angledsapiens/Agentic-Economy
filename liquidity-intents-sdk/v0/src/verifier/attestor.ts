import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import { LiquidityIntent } from '../core/intent';
import { EAS_CONTRACT_ADDRESS_SEPOLIA, EAS_CONTRACT_ADDRESS_MAINNET } from '../config/env';

export class Attestor {
  private eas: EAS;
  private signer: ethers.Wallet;

  constructor(privateKey: string = "0x0123456789012345678901234567890123456789012345678901234567890123") {
    // Default to Sepolia for init, though address depends on mode
    this.eas = new EAS(EAS_CONTRACT_ADDRESS_SEPOLIA);
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    this.signer = new ethers.Wallet(privateKey, provider);
    this.eas.connect(this.signer);
  }

  async pushOutcomeAttestation(intent: LiquidityIntent, status: 'SUCCESS' | 'FAILURE'): Promise<string> {
    const mode = process.env.LIS_MODE as 'LOCAL' | 'TESTNET' | 'LIVE' || 'LOCAL';

    if (mode === 'TESTNET' || mode === 'LIVE') {
      const contractAddress = mode === 'LIVE' ? EAS_CONTRACT_ADDRESS_MAINNET : EAS_CONTRACT_ADDRESS_SEPOLIA;
      // Re-connect EAS to correct contract if needed (for now assume similar ABI/SDK handling)
      this.eas = new EAS(contractAddress);
      this.eas.connect(this.signer);

      try {
        console.log(`[EAS] ${mode} MODE: Pushing attestation to ${contractAddress}...`);
        const schemaEncoder = new SchemaEncoder("bytes32 intentId, string status");
        const encodedData = schemaEncoder.encodeData([
          { name: "intentId", value: ethers.id(intent.id), type: "bytes32" },
          { name: "status", value: status, type: "string" }
        ]);

        const tx = await this.eas.attest({
          schema: "0x0000000000000000000000000000000000000000000000000000000000000000", // TODO: Register Schema
          data: {
            recipient: intent.seller, // Attest to the Seller's performance
            expirationTime: 0n,
            revocable: true,
            data: encodedData,
          },
        });

        const newAttestationUID = await tx.wait();
        console.log(`[EAS] New attestation recorded: ${newAttestationUID}`);
        return newAttestationUID;
      } catch (error) {
        console.error(`[EAS] Failed to push attestation:`, error);
        throw error;
      }
    } else {
      console.log(`[EAS] LOCAL MODE: Logging attestation for ${intent.id}: ${status}`);
      return `0x_mock_attestation_${status.toLowerCase()}_${Date.now()}`;
    }
  }
}
