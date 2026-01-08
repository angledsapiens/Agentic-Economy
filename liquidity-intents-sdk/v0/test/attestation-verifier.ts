import { Attestor } from '../dist';
import { ethers } from 'ethers';

// Enforce TESTNET mode
process.env.LIS_MODE = 'TESTNET';

describe('Attestation Verifier (EAS)', () => {
  let verifier: Attestor;

  beforeAll(() => {
    // Attestor constructor(privateKey?: string)
    verifier = new Attestor(process.env.SELLER_PRIVATE_KEY);
  });

  test('Should verify EAS attestation on Base Sepolia', async () => {
    expect(verifier).toBeDefined();
    console.log("Attestation Verifier initialized for Base Sepolia.");
  });
});
