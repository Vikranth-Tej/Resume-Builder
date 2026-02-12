require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Starting Gemini API Test (gemini-flash-latest)...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("No API key found!");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        console.log("Sending test prompt...");
        const result = await model.generateContent("Say 'Gemini Flash is active' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log("Response:", text);
    } catch (error) {
        console.error("Test Failed!");
        console.error("Error Message:", error.message);
    }
}

test();
