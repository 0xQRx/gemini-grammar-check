import * as vscode from 'vscode';
import { checkGrammar, lastRequestData, lastResponseData } from './grammarChecker';

// Integrated panel for both text input and results
class GrammarCheckPanel {
  private panel: vscode.WebviewPanel;
  private editor: vscode.TextEditor;
  private selection: vscode.Selection;
  private resolvePromise?: (value: string | undefined) => void;
  private context: vscode.ExtensionContext;
  private initialText: string;
  private correctedText?: string;
  private isChecking: boolean = false;

  constructor(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    this.editor = editor;
    this.selection = editor.selection;
    this.context = context;
    this.initialText = editor.document.getText(this.selection);
    
    // Create and show the integrated panel
    this.panel = vscode.window.createWebviewPanel(
      'geminiGrammarCheck',
      'Gemini Grammar Check',
      vscode.ViewColumn.Beside, // Show beside the current editor
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
      }
    );

    // Initialize with input view
    this.showInputView();
    
    // Set up message handling
    this.panel.webview.onDidReceiveMessage(
      this.handleMessage.bind(this),
      undefined,
      context.subscriptions
    );
    
    // Handle panel disposal
    this.panel.onDidDispose(() => {
      if (this.resolvePromise) {
        this.resolvePromise(undefined);
      }
    });
  }

  // Show the input view for text confirmation
  private showInputView(): void {
    this.panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gemini Grammar Check</title>
      <style>
        body { 
          font-family: var(--vscode-font-family);
          font-size: var(--vscode-font-size);
          color: var(--vscode-editor-foreground);
          background-color: var(--vscode-editor-background);
          padding: 10px;
        }
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        textarea {
          width: 100%;
          min-height: 100px;
          max-height: 500px;
          height: auto;
          padding: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin-bottom: 10px;
          resize: vertical;
          font-family: var(--vscode-editor-font-family);
          font-size: var(--vscode-editor-font-size);
        }
        .result-container {
          width: 100%;
          min-height: 100px;
          max-height: 500px;
          height: auto;
          padding: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          overflow: auto;
          background-color: var(--vscode-editor-background);
          font-family: var(--vscode-editor-font-family);
          font-size: var(--vscode-editor-font-size);
          display: block;
        }
        .button-container {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
        }
        button {
          padding: 5px 10px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .status {
          margin: 10px 0;
          padding: 5px;
          background-color: var(--vscode-infoBackground);
          color: var(--vscode-infoForeground);
          display: ${this.isChecking ? 'block' : 'none'};
        }
        .hidden {
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h3>Text to Check</h3>
        <textarea id="textInput">${this.escapeHtml(this.initialText)}</textarea>
        
        <div class="button-container" id="inputButtons">
          <button id="checkButton">Check Grammar</button>
          <button id="cancelButton">Cancel</button>
        </div>
        
        <div class="status" id="statusMessage">Checking grammar...</div>
        
        <div id="resultSection" class="${this.correctedText ? '' : 'hidden'}">
          <h3>Corrected Text</h3>
          <pre class="result-container" id="resultContainer">${this.correctedText ? this.escapeHtml(this.correctedText) : 'No result yet'}</pre>
          
          <div class="button-container" id="resultButtons">
            <button id="replaceButton">Replace Text</button>
            <button id="copyButton">Copy to Clipboard</button>
            <button id="regenerateButton">Regenerate</button>
            <button id="debugRequestButton">Debug Request</button>
            <button id="debugResponseButton">Debug Response</button>
            <button id="closeButton">Close</button>
          </div>
        </div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        const textInput = document.getElementById('textInput');
        const statusMessage = document.getElementById('statusMessage');
        const resultSection = document.getElementById('resultSection');
        const resultContainer = document.getElementById('resultContainer');
        
        // State management
        const state = ${JSON.stringify({
          isChecking: this.isChecking,
          hasResult: !!this.correctedText
        })};
        
        // Set focus and place cursor at the end of text
        textInput.focus();
        textInput.setSelectionRange(textInput.value.length, textInput.value.length);
        
        // Auto-resize textarea based on content
        function autoResizeTextarea() {
          // Reset height to auto to properly calculate the new height
          textInput.style.height = 'auto';
          // Set height based on scrollHeight (content height)
          textInput.style.height = Math.min(Math.max(textInput.scrollHeight, 100), 500) + 'px';
        }
        
        // Initial resize
        autoResizeTextarea();
        
        // Resize on input
        textInput.addEventListener('input', autoResizeTextarea);
        
        // Update UI based on state
        function updateUI() {
          statusMessage.style.display = state.isChecking ? 'block' : 'none';
          resultSection.className = state.hasResult ? '' : 'hidden';
        }
        
        // Handle messages from the extension
        window.addEventListener('message', event => {
          const message = event.data;
          
          switch (message.type) {
            case 'showResults':
              state.isChecking = false;
              state.hasResult = true;
              resultContainer.innerHTML = message.result;
              resultSection.className = ''; // Show result section
              
              // Auto-size the result container based on content
              resultContainer.style.height = 'auto';
              resultContainer.style.height = Math.min(Math.max(resultContainer.scrollHeight, 100), 500) + 'px';
              
              updateUI();
              // Scroll to results
              resultSection.scrollIntoView({behavior: 'smooth'});
              break;
              
            case 'status':
              state.isChecking = message.isChecking;
              statusMessage.textContent = message.message;
              statusMessage.style.backgroundColor = 'var(--vscode-infoBackground)';
              statusMessage.style.color = 'var(--vscode-infoForeground)';
              statusMessage.style.display = 'block';
              updateUI();
              break;
              
            case 'error':
              state.isChecking = false;
              statusMessage.textContent = message.message;
              statusMessage.style.backgroundColor = 'var(--vscode-errorBackground)';
              statusMessage.style.color = 'var(--vscode-errorForeground)';
              statusMessage.style.display = 'block';
              break;
          }
        });
        
        // Input buttons
        document.getElementById('checkButton').addEventListener('click', () => {
          state.isChecking = true;
          updateUI();
          vscode.postMessage({ type: 'check', text: textInput.value });
        });
        
        document.getElementById('cancelButton').addEventListener('click', () => {
          vscode.postMessage({ type: 'cancel' });
        });
        
        // Result buttons
        if (document.getElementById('replaceButton')) {
          document.getElementById('replaceButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'replace' });
          });
        }
        
        if (document.getElementById('copyButton')) {
          document.getElementById('copyButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'copy' });
          });
        }
        
        if (document.getElementById('regenerateButton')) {
          document.getElementById('regenerateButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'regenerate' });
          });
        }
        
        if (document.getElementById('debugRequestButton')) {
          document.getElementById('debugRequestButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'debugRequest' });
          });
        }
        
        if (document.getElementById('debugResponseButton')) {
          document.getElementById('debugResponseButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'debugResponse' });
          });
        }
        
        if (document.getElementById('closeButton')) {
          document.getElementById('closeButton').addEventListener('click', () => {
            vscode.postMessage({ type: 'close' });
          });
        }
      </script>
    </body>
    </html>`;
  }

  // Show results in the same panel
  private showResults(result: string): void {
    this.correctedText = result;
    this.isChecking = false;
    
    // Re-render the entire webview with results section visible
    this.showInputView();
    
    // Also send a message to ensure client-side handling works
    this.panel.webview.postMessage({ 
      type: 'showResults', 
      result: this.escapeHtml(result),
      isChecking: false
    });
  }

  // Handle messages from the webview
  private async handleMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'check':
        this.isChecking = true;
        try {
          // Start grammar check
          const cancelTokenSource = new vscode.CancellationTokenSource();
          const result = await checkGrammar(message.text, cancelTokenSource.token);
          
          if (result === 'No changes needed') {
            this.isChecking = false;
            this.panel.webview.postMessage({ 
              type: 'status', 
              message: 'No grammar issues found. Your text is already well-written!', 
              isChecking: false 
            });
            // Show a permanent status message in the UI
            vscode.window.showInformationMessage('No grammar issues found.');
            return;
          }
          
          // Update UI with results
          this.showResults(result);
        } catch (error) {
          this.isChecking = false;
          this.panel.webview.postMessage({ 
            type: 'error', 
            message: `Error checking grammar: ${error instanceof Error ? error.message : String(error)}`,
            isChecking: false
          });
        }
        break;
        
      case 'replace':
        try {
          if (this.correctedText) {
            // Ensure we're using the original editor and selection
            this.editor.edit(editBuilder => {
              editBuilder.replace(this.selection, this.correctedText!);
            }).then(success => {
              if (success) {
                vscode.window.showInformationMessage('Text replaced successfully.');
                this.panel.dispose();
                if (this.resolvePromise) {
                  this.resolvePromise('Replace Text');
                }
              } else {
                this.panel.webview.postMessage({ 
                  type: 'error', 
                  message: 'Could not replace text. The editor may have changed.'
                });
              }
            });
          }
        } catch (error) {
          this.panel.webview.postMessage({ 
            type: 'error', 
            message: `Failed to replace text: ${error instanceof Error ? error.message : String(error)}`
          });
        }
        break;
        
      case 'copy':
        if (this.correctedText) {
          await vscode.env.clipboard.writeText(this.correctedText);
          vscode.window.showInformationMessage('Corrected text copied to clipboard.');
          this.panel.dispose();
          if (this.resolvePromise) {
            this.resolvePromise('Copy to Clipboard');
          }
        }
        break;
        
      case 'regenerate':
        // Keep the current text but re-run the check with it
        this.isChecking = true;
        this.panel.webview.postMessage({ type: 'status', message: 'Regenerating...', isChecking: true });
        
        try {
          // Re-run the grammar check with the same text
          const cancelTokenSource = new vscode.CancellationTokenSource();
          // Use the original editor text for regeneration
          const textToCheck = this.editor.document.getText(this.selection);
          const result = await checkGrammar(textToCheck, cancelTokenSource.token);
          
          if (result === 'No changes needed') {
            this.isChecking = false;
            this.panel.webview.postMessage({ 
              type: 'status', 
              message: 'No grammar issues found. Your text is already well-written!', 
              isChecking: false 
            });
            vscode.window.showInformationMessage('No grammar issues found.');
            return;
          }
          
          // Show the new results
          this.showResults(result);
        } catch (error) {
          this.isChecking = false;
          this.panel.webview.postMessage({ 
            type: 'error', 
            message: `Error regenerating: ${error instanceof Error ? error.message : String(error)}`,
            isChecking: false
          });
        }
        break;
        
      case 'debugRequest':
        // Show last request data in a new editor
        if (lastRequestData) {
          const document = await vscode.workspace.openTextDocument({
            content: JSON.stringify(lastRequestData, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
        } else {
          vscode.window.showInformationMessage('No request data available. Run a grammar check first.');
        }
        break;
        
      case 'debugResponse':
        // Show last response data in a new editor
        if (lastResponseData) {
          const document = await vscode.workspace.openTextDocument({
            content: lastResponseData,
            language: 'text'
          });
          await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
        } else {
          vscode.window.showInformationMessage('No response data available. Run a grammar check first.');
        }
        break;
        
      case 'cancel':
      case 'close':
        this.panel.dispose();
        if (this.resolvePromise) {
          this.resolvePromise(undefined);
        }
        break;
    }
  }

  // Wait for user interaction
  public async waitForAction(): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  // Helper function to escape HTML special characters
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#039;');
  }
}

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#039;');
}

export function activate(context: vscode.ExtensionContext) {
  // Command to set API key
  let setApiKeyDisposable = vscode.commands.registerCommand('gemini-grammar-check.setApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Gemini API key',
      password: true, // Mask the input for security
      placeHolder: 'Your Gemini API key'
    });
    
    if (apiKey) {
      // Save to settings
      const config = vscode.workspace.getConfiguration('geminiGrammarCheck');
      await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Gemini API key saved successfully');
    }
  });
  
  context.subscriptions.push(setApiKeyDisposable);
  
  // Main command to check grammar
  let disposable = vscode.commands.registerCommand('gemini-grammar-check.checkGrammar', async () => {
    // Get the active editor when the command is executed
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage('Please select text to check');
      return;
    }

    // Create and use the integrated panel
    const grammarPanel = new GrammarCheckPanel(editor, context);
    await grammarPanel.waitForAction();
  });

  context.subscriptions.push(disposable);
  
  // Debug commands
  let debugRequestDisposable = vscode.commands.registerCommand('gemini-grammar-check.debugLastRequest', async () => {
    if (lastRequestData) {
      const document = await vscode.workspace.openTextDocument({
        content: JSON.stringify(lastRequestData, null, 2),
        language: 'json'
      });
      await vscode.window.showTextDocument(document);
    } else {
      vscode.window.showInformationMessage('No request data available. Run a grammar check first.');
    }
  });
  
  let debugResponseDisposable = vscode.commands.registerCommand('gemini-grammar-check.debugLastResponse', async () => {
    if (lastResponseData) {
      const document = await vscode.workspace.openTextDocument({
        content: lastResponseData,
        language: 'text'
      });
      await vscode.window.showTextDocument(document);
    } else {
      vscode.window.showInformationMessage('No response data available. Run a grammar check first.');
    }
  });
  
  context.subscriptions.push(debugRequestDisposable);
  context.subscriptions.push(debugResponseDisposable);
  
  // Check if API key is set, and prompt user if it's not
  const config = vscode.workspace.getConfiguration('geminiGrammarCheck');
  const apiKey = config.get<string>('apiKey');
  if (!apiKey) {
    // Show a message to set up the API key on first activation
    vscode.window.showInformationMessage(
      'Gemini Grammar Check requires an API key to function.', 
      'Set API Key'
    ).then(selection => {
      if (selection === 'Set API Key') {
        vscode.commands.executeCommand('gemini-grammar-check.setApiKey');
      }
    });
  }
}

export function deactivate() {}
