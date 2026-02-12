const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate a professional summary based on user details
 * @param {string} jobTitle 
 * @param {string} experience 
 * @returns {Promise<string>} Generated summary
 */
const generateSummary = async (jobTitle, experience) => {
    const prompt = `Generate a professional resume summary for a ${jobTitle} with the following experience: ${experience}. Keep it concise, impactful, and under 50 words.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate summary");
    }
};

/**
 * Improve a specific bullet point
 * @param {string} originalText 
 * @returns {Promise<string>} Improved text
 */
const improveBulletPoint = async (originalText) => {
    const prompt = `Rewrite the following resume bullet point to be more professional, using action verbs and quantifying results where possible: "${originalText}". Provide only the improved version.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to improve content");
    }
};

module.exports = { generateSummary, improveBulletPoint };
