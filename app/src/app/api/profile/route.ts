import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Navigate to the sibling directory 'aiconomy-arc-hackathon-sf'
    // process.cwd() is the root of the 'app' directory
    const corePath = path.resolve(process.cwd(), '../aiconomy-arc-hackathon-sf');
    const policyPath = path.join(corePath, 'Policy.json');

    // Also try to read package.json for identity info
    const packagePath = path.join(corePath, 'package.json');
    let identityName = '@agentic-economy/liquidity-intents-sdk-v0';

    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.name) identityName = pkg.name;
      } catch (e) {
        console.error("Failed to parse package.json", e);
      }
    }

    if (!fs.existsSync(policyPath)) {
      // Fallback to reasonable defaults if Policy.json not found
      return NextResponse.json({
        identity: {
          name: identityName,
          id: "did:lis:autonomous-commerce-agent",
          network: "ARC Testnet (Chain ID 5042002)"
        },
        policy: {
          dailyLimit: 50,         // 50 USDC daily (conservative default)
          globalLimit: 100,       // 100 USDC global (conservative default)
          approvalThreshold: 10,  // 10 USDC requires approval
          managerMode: 'Autonomous'
        }
      });
    }

    const policyData = fs.readFileSync(policyPath, 'utf8');
    const policyJson = JSON.parse(policyData);

    // Convert Policy.json values (in wei) to USDC for display
    // Policy.json has values like "10000000" which is 10 USDC (10 * 1,000,000 wei)
    const dailyLimit = policyJson.dailyLimit ? Number(policyJson.dailyLimit) / 1_000_000 : 50;
    const globalLimit = policyJson.globalLimit ? Number(policyJson.globalLimit) / 1_000_000 : 100;
    const approvalThreshold = policyJson.autoApproveBelow ? Number(policyJson.autoApproveBelow) / 1_000_000 : 1;

    return NextResponse.json({
      identity: {
        name: identityName,
        id: "did:lis:autonomous-commerce-agent",
        network: "ARC Testnet (Chain ID 5042002)"
      },
      policy: {
        dailyLimit: dailyLimit,
        globalLimit: globalLimit,
        approvalThreshold: approvalThreshold,
        managerMode: policyJson.requireApproval ? 'Safeguarded' : 'Autonomous'
      }
    });
  } catch (error) {
    console.error("API Profile Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
