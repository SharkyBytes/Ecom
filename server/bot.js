// --- Configuration ---
// Use the dotenv library to load environment variables from the .env file
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("Error: Make sure TELEGRAM_BOT_TOKEN and GEMINI_API_KEY are set in your .env file.");
  process.exit(1);
}

// --- Your Custom Tools / Functions ---
// This is where you define the functions Gemini can call.
// This is a FAKE database for demonstration. Replace this with your actual database calls.

const getAccountDetails = (args) => {
  const { userId } = args;
  console.log(`Fetching account details for user_id: ${userId}`);

  // FAKE DATABASE
  const fakeDatabase = {
    "user123": {
      name: "Alice",
      email: "alice@example.com",
      open_orders: [
        { order_id: "ORD987", item: "Laptop Stand", status: "Shipped" },
        { order_id: "ORD988", item: "Wireless Mouse", status: "Processing" },
      ],
      membership_level: "Gold"
    },
    "testuser": {
      name: "Bob",
      email: "bob@test.com",
      open_orders: [],
      membership_level: "Silver"
    }
  };

  const userData = fakeDatabase[userId];

  if (userData) {
    // Gemini needs the function output to be a JSON string or object
    return userData;
  } else {
    return { error: "User not found. Please provide a valid user ID like 'user123' or 'testuser'." };
  }
};

// --- Gemini Model and Chat Handling ---

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  // Define your tools for the model to use
  tools: {
    functionDeclarations: [
      {
        name: "get_account_details",
        description: "Gets the account details for a given user ID from the database.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: {
              type: "STRING",
              description: "The unique identifier for the user (e.g., their Telegram username)."
            }
          },
          required: ["userId"]
        }
      }
    ]
  }
});

// An object to hold chat sessions for different users
const userChats = {};

// --- Telegram Bot Setup ---

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Telegram bot is running...');

// Listener for the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  const welcomeText = `Hi ${userName}! I'm your E-commerce Bot, powered by Gemini 🤖\n\n` +
    "You can ask me questions about your account. For example:\n" +
    "- 'What are the open orders for user123?'\n" +
    "- 'Tell me about the account for testuser.'\n\n" +
    "Just type your question!";
  bot.sendMessage(chatId, welcomeText);
});

// Listener for any text message
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Ignore commands
  if (userMessage.startsWith('/')) {
    return;
  }
  
  // Show a "typing..." indicator in the chat
  bot.sendChatAction(chatId, 'typing');

  try {
    // Get or create a chat session for the user
    if (!userChats[chatId]) {
      const systemInstruction = "You are a helpful e-commerce assistant. " +
        "Your goal is to help users by answering their questions about their accounts. " +
        "Use the provided tools to fetch user data. " +
        "When asked about an account, assume the user_id is their Telegram username unless they specify another one. " +
        "For this demo, tell users they can ask about 'user123' or 'testuser'.";
        
      // Start a new chat with automatic function calling enabled
      userChats[chatId] = model.startChat({
        tools: { functionDeclarations: model.tools.functionDeclarations },
        toolConfig: {
            functionCallingConfig: {
                mode: 'AUTO'
            }
        },
        systemInstruction: systemInstruction,
      });
    }

    // Send the message to Gemini
    const result = await userChats[chatId].sendMessage(userMessage);
    
    // The Gemini Node.js SDK currently requires manual handling of function calls
    const call = result.response.functionCalls()?.[0];

    if (call) {
        // If Gemini wants to call a function...
        const { name, args } = call;
        if (name === 'get_account_details') {
            const apiResponse = getAccountDetails(args);
            
            // Send the function's response back to the model
            const result2 = await userChats[chatId].sendMessage([
                {
                    functionResponse: {
                        name: 'get_account_details',
                        response: apiResponse,
                    },
                },
            ]);
            
            // The final response from the model after getting the function data
            const finalResponse = result2.response.text();
            bot.sendMessage(chatId, finalResponse);
        }
    } else {
        // If it's a direct text response...
        const finalResponse = result.response.text();
        bot.sendMessage(chatId, finalResponse);
    }

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    bot.sendMessage(chatId, "Sorry, I'm having trouble thinking right now. Please try again later.");
  }
});

