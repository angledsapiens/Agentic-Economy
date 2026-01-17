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
    let identityName = 'Autonomous Agent';

    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.name) identityName = pkg.name;
      } catch (e) {
        console.error("Failed to parse package.json", e);
      }
    }

    if (!fs.existsSync(policyPath)) {
      return NextResponse.json({
        error: 'Policy.json not found in core directory',
        path: policyPath
      }, { status: 404 });
    }

    const policyData = fs.readFileSync(policyPath, 'utf8');
    const policy = JSON.parse(policyData);

    return NextResponse.json({
      identity: {
        name: identityName,
        id: "local-agent-v1"
      },
      policy
    });
  } catch (error) {
    console.error("API Profile Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
