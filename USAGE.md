# Gemini Grammar Check - Usage Guide

## Setup

1. Install the extension in VS Code
2. Set your Gemini API key using the "Set Gemini API Key" command in VS Code:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Type "Set Gemini API Key" and select it
   - Enter your API key from Google AI Studio when prompted

## Custom System Prompt

You can customize how the grammar checker works by creating a custom system prompt:

1. Create a text file with your custom instructions
2. Go to VS Code settings (File > Preferences > Settings)
3. Search for "Gemini Grammar Check"
4. In the "Custom Prompt Path" field, enter the absolute path to your prompt file

You can use the provided `default-prompt.txt` as a template.

## Using the Extension

1. Select text in your VS Code editor
2. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
3. The extension opens a single panel with your selected text
4. Click the "Check Grammar" button to analyze the text
5. After processing, the corrected text appears in the same panel
6. Choose from the options:
   - Replace Text: Replace the selected text with the corrected version
   - Copy to Clipboard: Copy the corrected text to your clipboard
   - Regenerate: Try again with different suggestions
   - Close: Cancel the operation

## Features

- Integrated single-panel interface for a better workflow
- Auto-sizing text areas that adjust to content length
- Grammar, spelling, and punctuation checking
- Improved text clarity and flow
- Preserves HTML and markdown formatting
- Sanitizes sensitive information like IP addresses and domain names
- Multiple options for handling corrected text

## Tips for Best Results

- Select complete paragraphs for better context
- For long texts, select and process smaller chunks at a time
- Use the regenerate button if you're not satisfied with the suggestions
- You can edit the text in the panel before checking grammar

## Troubleshooting

- If you get an error about the API key, make sure you've set it correctly in VS Code settings
- If the extension doesn't load, try restarting VS Code
- If text replacement doesn't work, ensure your editor hasn't changed focus
- For technical issues, check the VS Code Developer Tools console (Help > Toggle Developer Tools)