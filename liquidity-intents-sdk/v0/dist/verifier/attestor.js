"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attestor = void 0;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const ethers_1 = require("ethers");
const env_1 = require("../config/env");
class Attestor {
    constructor(privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123") {
        // Default to Sepolia for init, though address depends on mode
        this.eas = new eas_sdk_1.EAS(env_1.EAS_CONTRACT_ADDRESS_SEPOLIA);
        const provider = new ethers_1.ethers.JsonRpcProvider("https://sepolia.base.org");
        this.signer = new ethers_1.ethers.Wallet(privateKey, provider);
        this.eas.connect(this.signer);
    }
    async pushOutcomeAttestation(intent, status) {
        const mode = process.env.LIS_MODE || 'LOCAL';
        if (mode === 'TESTNET' || mode === 'LIVE') {
            const contractAddress = mode === 'LIVE' ? env_1.EAS_CONTRACT_ADDRESS_MAINNET : env_1.EAS_CONTRACT_ADDRESS_SEPOLIA;
            // Re-connect EAS to correct contract if needed (for now assume similar ABI/SDK handling)
            this.eas = new eas_sdk_1.EAS(contractAddress);
            this.eas.connect(this.signer);
            try {
                console.log(`[EAS] ${mode} MODE: Pushing attestation to ${contractAddress}...`);
                const schemaEncoder = new eas_sdk_1.SchemaEncoder("bytes32 intentId, string status");
                const encodedData = schemaEncoder.encodeData([
                    { name: "intentId", value: ethers_1.ethers.id(intent.id), type: "bytes32" },
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
            }
            catch (error) {
                console.error(`[EAS] Failed to push attestation:`, error);
                throw error;
            }
        }
        else {
            console.log(`[EAS] LOCAL MODE: Logging attestation for ${intent.id}: ${status}`);
            return `0x_mock_attestation_${status.toLowerCase()}_${Date.now()}`;
        }
    }
}
exports.Attestor = Attestor;
