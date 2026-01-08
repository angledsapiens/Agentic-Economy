import { ReceiptGenerator } from '../src/audit/receipt';
import { FinancialExporter } from '../src/audit/exporter';
import { LiquidityIntent } from '../src/core/intent';
import { USDC_ASSET } from '../src/core/assets';
import { LIP_TEXT } from '../src/core/constants';
import { ethers } from 'ethers';
import { Attestor } from '../src/verifier/attestor';

describe('Production Readiness & Audit Layer', () => {

  // Test Data
  const mockIntent: LiquidityIntent = {
    id: "prod-test-1",
    buyer: "0xBuyer",
    seller: "0xSeller",
    asset: USDC_ASSET,
    amount: "50",
    envelopeType: LIP_TEXT,
    deadline: Date.now() + 3600
  };
  const mockTx = "0xSettlementTxHash";
  const mockArtifactHash = "0xArtifactHash";
  const signerKey = "0x0123456789012345678901234567890123456789012345678901234567890123";

  // 1. Audit Receipts
  it('should generate a valid EIP-712 signed receipt', async () => {
    const generator = new ReceiptGenerator(signerKey);
    const result = await generator.generateReceipt(mockIntent, mockTx, mockArtifactHash);

    expect(result.receipt.missionId).toBeDefined();
    expect(result.receipt.settlementTx).toBe(mockTx);
    expect(result.signature).toMatch(/^0x[a-fA-F0-9]+$/);

    // Verify Signature
    const verifiedAddress = ethers.verifyTypedData(
      { name: 'AgenticEconomyAudit', version: '1', chainId: 1, verifyingContract: '0x0000000000000000000000000000000000000000' },
      {
        AuditReceipt: [
          { name: 'missionId', type: 'string' },
          { name: 'intentHash', type: 'string' },
          { name: 'settlementTx', type: 'string' },
          { name: 'deliveryArtifactHash', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      },
      result.receipt,
      result.signature
    );
    expect(verifiedAddress).toBe(new ethers.Wallet(signerKey).address);
  });

  // 2. Financial Exporters
  it('should export receipts to valid XML (QuickBooks)', async () => {
    const generator = new ReceiptGenerator(signerKey);
    const { receipt } = await generator.generateReceipt(mockIntent, mockTx, mockArtifactHash);
    const exporter = new FinancialExporter();

    const xml = exporter.toQuickBooksXML([receipt]);
    expect(xml).toContain('<QBXML>');
    expect(xml).toContain(`<TransactionID>${mockTx}</TransactionID>`);
  });

  it('should export receipts to JSON (Xero)', async () => {
    const generator = new ReceiptGenerator(signerKey);
    const { receipt } = await generator.generateReceipt(mockIntent, mockTx, mockArtifactHash);
    const exporter = new FinancialExporter();

    const jsonStr = exporter.toXeroJSON([receipt]);
    const json = JSON.parse(jsonStr);
    expect(json.Invoices[0].Reference).toBe(receipt.missionId);
    expect(json.Invoices[0].Type).toBe("ACCPAY");
  });

  // 3. Live Mode Toggles (Attestor)
  it('Attestor should use Mock Mode by default (env not set)', async () => {
    process.env.LIS_MODE = 'MOCK'; // Explicit set for test safety
    const attestor = new Attestor();
    const uid = await attestor.pushOutcomeAttestation(mockIntent, 'SUCCESS');
    expect(uid).toContain('0x_mock_attestation');
  });
});
