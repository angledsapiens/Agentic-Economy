import * as vscode from "vscode";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the sidebar (React App)
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "killSwitch": {
          const fs = require('fs');
          const path = require('path');
          const lockPath = path.join(this._extensionUri.fsPath, '..', 'STOP.LOCK');

          fs.writeFileSync(lockPath, 'EMERGENCY_STOP_ACTIVATED ' + new Date().toISOString());

          vscode.window.showErrorMessage("🚨 EMERGENCY STOP ACTIVATED: Treasury transactions are now BLOCKED.");
          vscode.window.showWarningMessage(`Lockfile created at: ${lockPath}`);
          break;
        }
        case "removeLock": {
          const fs = require('fs');
          const path = require('path');
          const lockPath = path.join(this._extensionUri.fsPath, '..', 'STOP.LOCK');

          if (fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath);
            vscode.window.showInformationMessage("✅ TREASURY UNLOCKED: Signing Authority Restored.");
          } else {
            vscode.window.showWarningMessage("System was not locked.");
          }
          break;
        }
        case "approveDemo": {
          const cp = require('child_process');
          const path = require('path');
          const scriptPath = path.resolve(this._extensionUri.fsPath, '..', 'src', 'demo_agent_handshake.ts');

          vscode.window.showInformationMessage("🤖 Demo Agent: Executing Payment...");

          cp.exec(`npx tsx "${scriptPath}"`, { cwd: path.join(this._extensionUri.fsPath, '..') }, (err: any, stdout: string, stderr: string) => {
            if (err) {
              console.error(stderr);
              this._view?.webview.postMessage({ type: 'demoError', value: 'Payment Failed' });
              return;
            }

            // Extract TxHash from stdout
            // Log format: [SUCCESS] 0.01 USDC transferred via <txId>
            const match = stdout.match(/via ([a-f0-9-]+)/);
            const txId = match ? match[1] : 'Unknown';

            this._view?.webview.postMessage({
              type: 'demoComplete',
              data: { txId: txId, amount: '0.01', recipient: 'Agent Auditor' }
            });

            vscode.window.showInformationMessage("✅ Payment Confirmed on Chain");
          });
          break;
        }
      }
    });

    // POLLING DATA LOOP
    const updateData = () => {
      const cp = require('child_process');
      const path = require('path');
      // Point to the PARENT directory script
      // Note: In production, we'd bundle this logic. For PoC, we run the script via node.
      const scriptPath = path.resolve(this._extensionUri.fsPath, '..', 'get_status.ts');

      // We use npx tsx to run the script
      cp.exec(`npx tsx "${scriptPath}"`, { cwd: path.join(this._extensionUri.fsPath, '..') }, (err: any, stdout: string, stderr: string) => {
        if (err) {
          console.error('Polling error:', stderr);
          return;
        }
        try {
          const jsonStart = stdout.indexOf('<<<JSON_START>>>');
          const jsonEnd = stdout.indexOf('<<<JSON_END>>>');

          if (jsonStart === -1 || jsonEnd === -1) {
            // Fallback for backward compatibility or if delimiters missing
            console.warn('Delimiters not found, attempting raw parse');
            const fStart = stdout.indexOf('{');
            const fEnd = stdout.lastIndexOf('}');
            if (fStart !== -1 && fEnd !== -1) {
              const rawJson = stdout.substring(fStart, fEnd + 1);
              const data = JSON.parse(rawJson);
              webviewView.webview.postMessage({ type: 'update', data: data });
              return;
            }
            throw new Error('No JSON Found');
          }

          const jsonStr = stdout.substring(jsonStart + 16, jsonEnd).trim();
          const data = JSON.parse(jsonStr);
          webviewView.webview.postMessage({
            type: 'update',
            data: data
          });
        } catch (e) {
          console.error('Parse error:', e);
          webviewView.webview.postMessage({
            type: 'onError',
            value: 'Sync Failed: Invalid Data from CLI'
          });
        }
      });
    };

    // Poll every 3 seconds
    setInterval(updateData, 3000);
    updateData(); // Initial load
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js")
    );

    // Inject Theme Variables
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<title>Mission Control</title>
			</head>
			<body>
				<div id="root">Loading Mission Control...</div>
				<script>
                    window.onerror = function(message, source, lineno, colno, error) {
                        document.getElementById('root').innerHTML = '<h3 style="color:red">Script Error: ' + message + '</h3>';
                    };
                </script>
				<script nonce="${nonce}" src="${scriptUri}" onerror="document.getElementById('root').innerText='FATAL: Script Failed to Load (Check Path/Network)';"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
