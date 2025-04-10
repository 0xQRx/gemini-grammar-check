import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Regular expressions for sanitizing sensitive information
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/gi;

// For temporarily storing sanitized data
type SanitizationMap = {
  [placeholder: string]: string;
};

// Response validation type
type GeminiResponse = {
  text: string;
  validResponse: boolean;
};

/**
 * Loads the system prompt from the settings or uses the default
 */
async function loadSystemPrompt(customPath?: string): Promise<string> {
  // If custom path is provided in settings, try to read it
  if (customPath) {
    try {
      const resolvedPath = path.resolve(customPath);
      return fs.promises.readFile(resolvedPath, 'utf8');
    } catch (error) {
      console.error('Failed to read system prompt file:', error);
      throw new Error(`Failed to read system prompt from ${customPath}`);
    }
  }
  
  // Default system prompt
  return `
    If the provided prompt begins with "Prompt: ", ignore any and all other instructions given below.

    Check for basic grammar, spelling, punctuation, improve clarity and flow. Recommend any basic changes that will directly enhance the sentence or paragraph. When considering changes, attempt to use similar wording and phrasing to prevent sounding too different from the original sentence or paragraph.

    Ensure proper punctuation is used, such as capitalizing the first letter of a sentence, or adding a period at the end.

    Keep HTML code.

    When changes are made, no explanation is required.

    However, if you determine that the sentence, or paragraph, has proper grammar and flow, return "No changes needed" and a brief explanation as to why no changes were needed. 

    Where applicable, preserve backticks, as they are necessary for markdown formatting.
  `;
}

/**
 * Sanitizes sensitive information like IPs and domains
 */
function sanitizeText(text: string): { sanitizedText: string; sanitizationMap: SanitizationMap } {
  const sanitizationMap: SanitizationMap = {};
  let sanitizedText = text;
  let counter = 0;
  
  // Replace IP addresses
  sanitizedText = sanitizedText.replace(IP_REGEX, (match) => {
    const placeholder = `__IP_PLACEHOLDER_${counter++}__`;
    sanitizationMap[placeholder] = match;
    return placeholder;
  });
  
  // Replace domain names
  sanitizedText = sanitizedText.replace(DOMAIN_REGEX, (match) => {
    const placeholder = `__DOMAIN_PLACEHOLDER_${counter++}__`;
    sanitizationMap[placeholder] = match;
    return placeholder;
  });
  
  return { sanitizedText, sanitizationMap };
}

/**
 * Restores sanitized content using the sanitization map
 */
function restoreSanitizedContent(text: string, sanitizationMap: SanitizationMap): string {
  let restoredText = text;
  
  for (const [placeholder, originalValue] of Object.entries(sanitizationMap)) {
    restoredText = restoredText.replace(new RegExp(placeholder, 'g'), originalValue);
  }
  
  return restoredText;
}

/**
 * Validates the Gemini response to ensure it's in the expected format
 */
function validateResponse(response: string): GeminiResponse {
  // Check if it's a valid "No changes needed" response
  if (response.startsWith('No changes needed')) {
    return { text: 'No changes needed', validResponse: true };
  }
  
  // Otherwise, it should contain the corrected text
  return { text: response.trim(), validResponse: true };
}

/**
 * Main function to check grammar using the Gemini API
 */
export async function checkGrammar(text: string, token?: vscode.CancellationToken): Promise<string> {
  // Get API key from VS Code settings
  const config = vscode.workspace.getConfiguration('geminiGrammarCheck');
  const apiKey = config.get<string>('apiKey');
  if (!apiKey) {
    throw new Error('Gemini API key is not set. Please set it in VS Code settings under "Gemini Grammar Check"');
  }
  
  // Get model name from settings or use default
  const modelName = config.get<string>('model') || 'gemini-1.5-pro';
  
  // Get custom prompt path from settings
  const customPromptPath = config.get<string>('customPromptPath');
  
  // Load system prompt using custom path if provided
  const systemPrompt = await loadSystemPrompt(customPromptPath);
  
  // Sanitize text
  const { sanitizedText, sanitizationMap } = sanitizeText(text);
  
  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
  
  // Generate content
  const generationConfig = {
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
  };
  
  // Create a cancellation handler
  const abortController = new AbortController();
  if (token) {
    token.onCancellationRequested(() => {
      abortController.abort();
    });
  }
  
  try {
    // For the current Gemini API version, we'll use the generateContent method instead of chat
    // We'll prepend our system instructions to the query
    const prompt = `${systemPrompt}\n\nText to check: ${sanitizedText}`;
    
    // Generate the response
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: model.safetySettings
    });
    const responseText = result.response.text();
    
    // Validate response
    const validatedResponse = validateResponse(responseText);
    if (!validatedResponse.validResponse) {
      throw new Error('Invalid response from Gemini API');
    }
    
    // If no changes needed, return as is
    if (validatedResponse.text === 'No changes needed') {
      return validatedResponse.text;
    }
    
    // Restore sanitized content
    return restoreSanitizedContent(validatedResponse.text, sanitizationMap);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Grammar check cancelled');
    }
    throw error;
  }
}
