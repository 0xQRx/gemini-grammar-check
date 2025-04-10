# Gemini Grammar Check

A VS Code extension that uses the Gemini API to check grammar and improve text clarity.

## Features

- Grammar and text clarity checks using Google's Gemini API
- Improved text styling and readability 
- Single-window interface for better workflow
- Automatic text area sizing based on content
- Options to replace text, copy to clipboard, or regenerate
- Sanitizes sensitive information like IP addresses and domain names
- Keyboard shortcut: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)

## Requirements

- VS Code version 1.60.0 or higher
- You need a Gemini API key from [Google AI Studio](https://ai.google.dev/)

## Configuration

### Setting up your API Key

After installation, you need to set up your Gemini API key in VS Code:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Set Gemini API Key" and select it
3. Enter your Gemini API key when prompted

### Additional Settings

You can customize these settings in VS Code's settings:

- `geminiGrammarCheck.apiKey`: Your Gemini API key
- `geminiGrammarCheck.model`: Which Gemini model to use (default: gemini-1.5-pro)
- `geminiGrammarCheck.customPromptPath`: Path to a file containing your custom system prompt

## Building and Installing

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/0xQRx/gemini-grammar-check.git
   cd gemini-grammar-check
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

### Creating VSIX Package

1. Install VS Code Extension Manager if you don't have it:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Create the VSIX package:
   ```bash
   vsce package
   ```
   This will generate a `.vsix` file in the root directory.

### Installing the Extension

#### From VSIX file

1. In VS Code, open Extensions view (Ctrl+Shift+X)
2. Click the "..." menu (More Actions) at the top
3. Select "Install from VSIX..."
4. Navigate to and select the generated `.vsix` file

#### For Development

1. Open the project in VS Code
2. Press F5 to launch a development instance with the extension loaded

## Usage

1. Select text in the editor
2. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
3. Review your text in the integrated panel
4. Click "Check Grammar" to analyze the text
5. Choose from the options:
   - Replace Text: Replace the selected text with the corrected version
   - Copy to Clipboard: Copy the corrected text to your clipboard
   - Regenerate: Try again with different suggestions
   - Close: Cancel the operation

## Troubleshooting

- If you encounter errors, make sure your Gemini API key is set correctly
- Check that you have an active internet connection
- For more detailed help, see the [USAGE.md](USAGE.md) guide

## Contributing & Development

### Automated Builds and Releases

This project uses GitHub Actions for automated builds and releases:

1. **Continuous Integration**: Every push to master/main and every pull request is automatically tested
2. **Automated Releases**: When you create and push a new tag that starts with 'v' (e.g., v0.1.3), GitHub Actions will:
   - Build the extension
   - Package it as a VSIX file
   - Create a GitHub Release with the VSIX attached

### Creating a New Release

To create a new release:

1. Update the version in package.json
2. Update CHANGELOG.md with the changes
3. Commit these changes: `git commit -am "Bump version to x.y.z"`
4. Run `npm run create-release` which will:
   - Create a git tag based on the version in package.json
   - Push the tag to GitHub
5. GitHub Actions will automatically build and publish the release

Alternatively, you can manually create and push a tag:
```bash
git tag -a v0.1.3 -m "Release v0.1.3"
git push origin v0.1.3
```
