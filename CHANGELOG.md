# Changelog

## v0.1.4 (2025-04-11)

- Added debugging tools for troubleshooting API interactions
- Added "Debug Request" and "Debug Response" buttons to view LLM data
- Added commands to show last request and response data
- Fixed API key handling for better security and reliability

## v0.1.3 (2025-04-10)

- Updated to use the new @google/genai v0.8.0 API
- Added support for newer Gemini models
- Added customizable generation parameters in settings:
  - Temperature (0-2)
  - TopK (1-100)
  - TopP (0-1)
  - Maximum output tokens (1-8192)
- Improved error handling for model not found scenarios
- Simplified API integration for better reliability

## v0.1.2 (2025-04-10)

- Fixed issue with text substitution by integrating the entire workflow in a single panel
- Improved UI with unified grammar check experience
- Enhanced stability when replacing text in the editor

## v0.1.1 (2025-04-10)

- Fix compatibility with @google/generative-ai v0.1.3
- Update the API integration to use generateContent instead of chat
- Improve error handling

## v0.1.0 (2025-04-10)

- Initial release
- Grammar and text clarity checks using Gemini API
- Environment variable configuration for API key and model
- Text sanitization for IPs and domains
- Custom system prompt support