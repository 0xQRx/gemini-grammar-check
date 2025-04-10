const { GoogleGenerativeAI } = require('@google/generative-ai');

// Log the module structure to understand the API
console.log('GoogleGenerativeAI:', Object.keys(GoogleGenerativeAI.prototype));

const genAI = new GoogleGenerativeAI('dummy-api-key');
console.log('genAI methods:', Object.keys(genAI));

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
console.log('model methods:', Object.keys(model));

// Log the type definitions if available
console.log('startChat params:', model.startChat.toString());