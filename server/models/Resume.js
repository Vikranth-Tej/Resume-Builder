const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: String, // Changed from ObjectId to String for public access
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'Untitled Resume'
    },
    personalInfo: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    summary: { type: String, default: '' },
    education: [
        {
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startDate: String,
            endDate: String,
            current: Boolean,
            description: String
        }
    ],
    experience: [
        {
            company: String,
            position: String,
            startDate: String,
            endDate: String,
            current: Boolean,
            description: String
        }
    ],
    skills: [
        {
            name: { type: String, required: true },
            level: { type: String, default: 'Intermediate' }
        }
    ],
    projects: [
        {
            name: String,
            description: String,
            technologies: String,
            link: String
        }
    ],
    responsibilities: [
        {
            role: String,
            organization: String,
            startDate: String,
            endDate: String,
            description: String
        }
    ],
    achievements: [
        {
            title: String,
            date: String,
            description: String
        }
    ],
    themeColor: {
        type: String,
        default: '#2563eb'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
