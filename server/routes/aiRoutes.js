const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate professional summary
// @route   POST /api/ai/generate-summary
// @access  Public
router.post('/generate-summary', async (req, res) => {
    const { jobTitle, experience, skills } = req.body;

    if (!jobTitle) {
        return res.status(400).json({ message: 'Job title is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Write a professional resume summary for a ${jobTitle} with these skills: ${req.body.skills ? JSON.stringify(req.body.skills) : 'general skills'}. 
        Experience details: ${req.body.experience ? JSON.stringify(req.body.experience) : 'No explicit experience provided'}. 
        Keep it professional, engaging, and under 400 characters.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ result: text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({
            message: "Failed to generate summary",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Improve specific text content
// @route   POST /api/ai/improve-text
// @access  Public
router.post('/improve-text', async (req, res) => {
    const { text, type } = req.body; // type: 'experience', 'project'

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Improve the following resume ${type || 'text'} to be more impactful, using action verbs and result-oriented language. 
        Original text: "${text}". 
        Return only the improved text, no conversational filler.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const improvedText = response.text();
        res.json({ result: improvedText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "Failed to improve text" });
    }
});

module.exports = router;
