const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Resume = require('../models/Resume');

// Configure Multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get all resumes for user (public/guest)
// @route   GET /api/resumes
// @access  Public
router.get('/', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get specific resume
// @route   GET /api/resumes/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (resume) {
            res.json(resume);
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Public
router.post('/', async (req, res) => {
    const { title, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const resume = new Resume({
            userId,
            title: title || 'Untitled Resume',
            personalInfo: {
                fullName: 'John Doe',
                email: 'john@example.com'
            },
            education: [],
            experience: [],
            skills: [],
            projects: [],
            responsibilities: [],
            achievements: []
        });

        const createdResume = await resume.save();
        res.status(201).json(createdResume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload & Parse PDF Resume
// @route   POST /api/resumes/upload
// @access  Public
router.post('/upload', upload.single('resume'), async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // 1. Extract text from PDF
        const data = await pdfParse(req.file.buffer);
        const extractedText = data.text;

        // 2. Use Gemini to structure the data
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
            You are an expert resume parser. Extract the following information from the resume text below and return ONLY VALID JSON formatted exactly as follows:
            {
                "personalInfo": {
                    "fullName": "Name",
                    "email": "Email",
                    "phone": "Phone",
                    "address": "Address",
                    "linkedin": "LinkedIn URL",
                    "website": "Website URL"
                },
                "summary": "Professional Summary",
                "education": [
                    { "institution": "School", "degree": "Degree", "startDate": "Year", "endDate": "Year", "description": "Details" }
                ],
                "experience": [
                    { "company": "Company", "position": "Title", "startDate": "Date", "endDate": "Date", "description": "Details" }
                ],
                "skills": [
                    { "name": "Skill Name" }
                ],
                "projects": [
                    { "name": "Project Name", "description": "Details", "technologies": "Tech Stack", "link": "URL" }
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON.
            Resume Text:
            ${extractedText.substring(0, 30000)} // Limit text length to avoid token limits
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        // 3. Parse JSON and Save
        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return res.status(500).json({ message: "Failed to parse resume data from AI" });
        }

        const newResume = new Resume({
            userId,
            title: `Uploaded Resume - ${new Date().toLocaleDateString()}`,
            personalInfo: parsedData.personalInfo || {},
            summary: parsedData.summary || '',
            education: parsedData.education || [],
            experience: parsedData.experience || [],
            skills: parsedData.skills || [],
            projects: parsedData.projects || []
        });

        const savedResume = await newResume.save();
        res.status(201).json(savedResume);

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Failed to process resume upload" });
    }
});

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume) {
            // Update fields
            resume.title = req.body.title || resume.title;
            resume.personalInfo = req.body.personalInfo || resume.personalInfo;
            resume.summary = req.body.summary || resume.summary;
            resume.education = req.body.education || resume.education;
            resume.experience = req.body.experience || resume.experience;
            resume.skills = req.body.skills || resume.skills;
            resume.projects = req.body.projects || resume.projects;
            resume.responsibilities = req.body.responsibilities || resume.responsibilities;
            resume.achievements = req.body.achievements || resume.achievements;
            resume.themeColor = req.body.themeColor || resume.themeColor;

            const updatedResume = await resume.save();
            res.json(updatedResume);
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume) {
            await resume.deleteOne();
            res.json({ message: 'Resume removed' });
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
