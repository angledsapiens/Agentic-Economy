import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const corePath = path.resolve(process.cwd(), '../aiconomy-arc-hackathon-sf');
    const logPath = path.join(corePath, 'TESTNET_EXECUTION_LOG.md');

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: 'No execution logs found.' });
    }

    const logs = fs.readFileSync(logPath, 'utf8');

    return NextResponse.json({
      logs
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
}
