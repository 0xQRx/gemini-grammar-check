# Gemini Grammar Check - Installation Guide

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [VS Code](https://code.visualstudio.com/) version 1.60.0 or higher
- Gemini API key from [Google AI Studio](https://ai.google.dev/)

## Installation Methods

### Method 1: Install from VSIX file

#### Build the Extension

1. Clone the repository:
   ```bash
   git clone https://github.com/0xQRx/gemini-grammar-check.git
   cd gemini-grammar-check
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Package the extension:
   ```bash
   # Install vsce if you don't have it
   npm install -g @vscode/vsce
   
   # Create the VSIX package
   vsce package
   ```
   This will create a `.vsix` file in the project root.

#### Install in VS Code

1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X)
3. Click on the "..." (More Actions) at the top of the Extensions view
4. Select "Install from VSIX..."
5. Navigate to and select the `.vsix` file you created

### Method 2: Install from Source (for Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/0xQRx/gemini-grammar-check.git
   cd gemini-grammar-check
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open the project in VS Code:
   ```bash
   code .
   ```

4. Press F5 to start debugging, which will launch a new Extension Development Host window with your extension loaded.

### Method 3: Quick Install via Command Line

After building the VSIX file, you can install directly from the command line:

```bash
code --install-extension gemini-grammar-check-0.1.2.vsix
```

## Setting Up Your API Key

After installation, you need to set up your Gemini API key:

### Using Command Palette (Recommended)

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette
2. Type "Set Gemini API Key" and select the command
3. Enter your API key when prompted

### Via Settings UI

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "Gemini Grammar Check"
3. Fill in your API key in the `geminiGrammarCheck.apiKey` field

## Verify Installation

1. Open a text file in VS Code
2. Select some text in the editor
3. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
4. If the extension is working correctly, you'll see an integrated panel with your selected text
5. Click "Check Grammar" to test the functionality

## Updating the Extension

To update to a newer version:

1. Download or build the latest VSIX file
2. Go to Extensions view in VS Code
3. Uninstall the existing extension
4. Install the new version using "Install from VSIX..."

## Troubleshooting

- If npm commands are not working, ensure Node.js and npm are installed correctly
- If the extension isn't showing up in VS Code, try restarting VS Code
- If the extension loads but doesn't work, check that your API key is set correctly
- For technical issues, check the developer console in VS Code (Help > Toggle Developer Tools)