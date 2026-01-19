#!/bin/bash
echo "=== x402 Hardened Verification E2E Test ==="

# 1. Call /hire without proof (expect 402)
echo "1. Requesting /hire (no proof)..."
curl -v -X POST http://localhost:3001/hire -H 'Content-Type: application/json' -d '{}' > hire_noproof.txt 2>&1
if grep -q "402 Payment Required" hire_noproof.txt; then
    echo "✅ PASS: Rejected with 402"
else
    echo "❌ FAIL: Did not return 402"
    cat hire_noproof.txt
    exit 1
fi

# 2. Generate Real Payment
echo "2. Generating REAL ARC Testnet Payment (0.1 USDC)..."
# We need to run the node script. Use node from environment
TX_HASH=$(node scripts/pay_hire.js | tail -n 1)

if [[ ! $TX_HASH =~ ^0x[a-fA-F0-9]{64}$ ]]; then
    echo "❌ FAIL: Invalid TX Hash generated: $TX_HASH"
    exit 1
fi

echo "   Tx Hash: $TX_HASH"
echo "   Waiting 10s for confirmation/indexing..."
sleep 10

# 3. Call /hire OR verify using the hash
echo "3. Requesting /hire with proof..."
curl -v -X POST http://localhost:3001/hire \
  -H 'Content-Type: application/json' \
  -H "x402-proof: $TX_HASH" \
  -d '{"amount":"100000"}' > hire_proof.txt 2>&1

if grep -q "200 OK" hire_proof.txt; then
    echo "✅ PASS: Accepted with 200 OK"
    cat hire_proof.txt
else
    echo "❌ FAIL: Did not return 200"
    cat hire_proof.txt
    exit 1
fi

echo "=== E2E Test Complete: SUCCESS ==="
