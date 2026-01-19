#!/usr/bin/env bash
# x402 /hire endpoint acceptance tests

echo "====================================================="
echo "  x402 /hire Endpoint Acceptance Tests"
echo "====================================================="
echo ""

echo "TEST 1: GET /hire (should return 402, not 'Cannot GET')"
echo "-----------------------------------------------------"
curl -i http://localhost:3001/hire 2>/dev/null | head -n 15
echo ""
echo ""

echo "TEST 2: POST /hire with insufficient funds (should return 402 with autonomous log)"
echo "-----------------------------------------------------"
curl -i -X POST http://localhost:3001/hire \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | head -n 20
echo ""
echo ""

echo "TEST 3: POST /hire with x402-proof header (happy path - should return 200)"
echo "-----------------------------------------------------"
curl -i -X POST http://localhost:3001/hire \
  -H "Content-Type: application/json" \
  -H "x402-proof: 0x5eaf300c9b6d87477dfd0d23f0e25eaae58dad5c2db3c9f791884b7fc69bd328" \
  -d '{"sellerDid": "did:lis:test", "amount": "1000000"}' 2>/dev/null | head -n 20
echo ""
echo ""

echo "====================================================="
echo "  Tests Complete - Check terminal logs for:"
echo "  [x402] Insufficient funds — rejecting autonomously"
echo "====================================================="
