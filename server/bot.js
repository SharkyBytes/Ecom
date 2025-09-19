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

// Original function for account details
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
  return userData || { error: "User not found. Please provide a valid user ID like 'user123' or 'testuser'." };
};

// NEW: Function for the /info endpoint
const getInfo = () => {
  console.log("Function called: getInfo");
  return { status: "success", message: "hey /info is calling" };
};

// NEW: Function for the /products endpoint
const getProducts = () => {
  console.log("Function called: getProducts");
  return { 
    products: [
      { id: 'prod_01', name: 'Wireless Keyboard', price: 79.99 },
      { id: 'prod_02', name: '4K Monitor', price: 399.99 },
    ],
    message: "hey /products is calling"
  };
};

// NEW: Function for the /accounts endpoint
const getAccounts = () => {
  console.log("Function called: getAccounts");
  return { 
    total_sales: 1573.45,
    period: "Q3 2025",
    message: "hey /accounts is calling"
  };
};

// A "toolbelt" object that maps function names to the actual functions
const availableTools = {
  get_account_details: getAccountDetails,
  get_info: getInfo,
  get_products: getProducts,
  get_accounts: getAccounts,
};


// --- Gemini Model and Chat Handling ---

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  // Define all your tools for the model to use
  tools: {
    functionDeclarations: [
      {
        name: "get_account_details",
        description: "Gets the e-commerce account details for a given user ID.",
        parameters: { type: "OBJECT", properties: { userId: { type: "STRING", description: "The unique identifier for the user." }}, required: ["userId"] }
      },
      {
        name: "get_info",
        description: "Gets general information or status. Triggered by requests for 'info' or '/info'.",
        parameters: { type: "OBJECT", properties: {} } // No parameters needed
      },
      {
        name: "get_products",
        description: "Gets a list of available products. Triggered by requests for 'products', 'show me products', or '/products'.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "get_accounts",
        description: "Gets the total sales figures or account information. Triggered by requests for 'sales', 'accounts', or '/accounts'.",
        parameters: { type: "OBJECT", properties: {} }
      }
    ]
  }
});

const userChats = {};

// --- Telegram Bot Setup ---

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
console.log('Telegram bot is running...');

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  const welcomeText = `Hi ${userName}! I'm your E-commerce Bot, powered by Gemini 🤖\n\n` +
    "You can ask me things like:\n" +
    "- 'What are the open orders for user123?'\n" +
    "- '/info'\n" +
    "- 'Show me the products'\n" +
    "- '/accounts'";
  bot.sendMessage(chatId, welcomeText);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Ignore the /start command since it has its own handler
  if (userMessage.startsWith('/start')) {
    return;
  }
  
  bot.sendChatAction(chatId, 'typing');

  try {
    if (!userChats[chatId]) {
      const systemInstructionText = "You are a helpful e-commerce assistant. Your goal is to help users by answering their questions about their accounts, products, and sales. Use the provided tools to fetch data. Be concise and helpful.";
        
      userChats[chatId] = model.startChat({
        tools: { functionDeclarations: model.tools.functionDeclarations },
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        // FIX: systemInstruction must be an object, not a string
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
      });
    }

    const result = await userChats[chatId].sendMessage(userMessage);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      const { name, args } = call;
      console.log(`Gemini wants to call function: ${name} with args:`, args);

      // Check if the requested function exists in our toolbelt
      if (availableTools[name]) {
        const apiResponse = availableTools[name](args);
        
        // Send the function's response back to the model
        const result2 = await userChats[chatId].sendMessage([
          { functionResponse: { name: name, response: apiResponse } },
        ]);
        
        const finalResponse = result2.response.text();
        bot.sendMessage(chatId, finalResponse);
      } else {
        console.error(`Unknown function call: ${name}`);
        bot.sendMessage(chatId, `Sorry, I don't know how to do that.`);
      }
    } else {
      const finalResponse = result.response.text();
      bot.sendMessage(chatId, finalResponse);
    }

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    bot.sendMessage(chatId, "Sorry, I'm having trouble thinking right now. Please try again later.");
  }
});

