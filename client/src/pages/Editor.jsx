import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft, Wand2, Plus, Trash2, Sliders, LayoutTemplate, Minimize2, Download, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);

    // Formatting States
    const [textSize, setTextSize] = useState(11); // pt
    const [lineHeight, setLineHeight] = useState(1.5); // unitless multiplier
    const [sectionSpacing, setSectionSpacing] = useState(1.5); // rem

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await api.get(`/api/resumes/${id}`);
                setResume({
                    ...res.data,
                    experience: res.data.experience || [],
                    education: res.data.education || [],
                    skills: res.data.skills || [],
                    projects: res.data.projects || [],
                    responsibilities: res.data.responsibilities || [],
                    achievements: res.data.achievements || []
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching resume:", error);
                toast.error("Failed to load resume");
                navigate('/dashboard');
            }
        };
        fetchResume();
    }, [id, navigate]);

    const handleSave = async (silent = false) => {
        setSaving(true);
        try {
            await api.put(`/api/resumes/${id}`, resume);
            if (!silent) toast.success("Draft saved successfully");
        } catch (error) {
            console.error("Error saving resume:", error);
            if (!silent) toast.error("Failed to save draft");
        } finally {
            setSaving(false);
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById('resume-preview');
        const opt = {
            margin: 0,
            filename: `${resume.personalInfo.fullName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        toast.promise(
            html2pdf().set(opt).from(element).save(),
            {
                loading: 'Printing Edition...',
                success: 'Edition Printed!',
                error: 'Print Failed',
            }
        );
    };

    const handleChange = (section, field, value) => {
        setResume(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (section, index, field, value) => {
        const newArray = [...resume[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setResume(prev => ({ ...prev, [section]: newArray }));
    };

    const addItem = (section, defaultItem) => {
        setResume(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), defaultItem]
        }));
    };

    const removeItem = (section, index) => {
        const newArray = resume[section].filter((_, i) => i !== index);
        setResume(prev => ({ ...prev, [section]: newArray }));
    };

    const generateSummaryAI = async () => {
        setAiGenerating(true);
        const toastId = toast.loading("Consulting Editors...");
        try {
            const payload = {
                jobTitle: resume.title,
                experience: resume.experience,
                skills: resume.skills || []
            };

            const res = await api.post('/api/ai/generate-summary', payload);

            if (res.data && res.data.result) {
                setResume(prev => ({ ...prev, summary: res.data.result }));
                toast.success("Editorial composed!", { id: toastId });
            } else {
                throw new Error("No result from AI");
            }
        } catch (error) {
            console.error("AI Error:", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            toast.error(`Editorial failed: ${msg}`, { id: toastId });
        } finally {
            setAiGenerating(false);
        }
    };

    const improveTextAI = async (text, type, index, field) => {
        if (!text) return toast.error("Please enter some text to refine");
        const toastId = toast.loading("copy editing...");
        try {
            const res = await api.post('/api/ai/improve-text', {
                text,
                type
            });

            if (res.data && res.data.result) {
                handleArrayChange(type, index, field, res.data.result);
                toast.success("Copy refined!", { id: toastId });
            } else {
                throw new Error("No result from AI");
            }
        } catch (error) {
            console.error("AI Error:", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            toast.error(`Refinement failed: ${msg}`, { id: toastId });
        }
    };

    const applyCompactMode = () => {
        setTextSize(10);
        setLineHeight(1.2);
        setSectionSpacing(1.0);
        toast.success("Applied compact layout");
    };

    if (loading) return <div className="flex justify-center items-center h-screen font-serif text-[var(--news-ink)] bg-[var(--news-paper)]">Loading Manuscript...</div>;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[var(--news-paper)] overflow-hidden font-serif text-[var(--news-ink)]">
            {/* Left Sidebar - Editor Form */}
            <div className="w-full md:w-1/2 h-full overflow-y-auto bg-[var(--news-paper)] border-r border-[var(--news-border)] shadow-xl z-10 p-8 scrollbar-thin scrollbar-thumb-[var(--news-accent)]">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--news-paper)] z-20 pb-4 border-b border-[var(--news-border)]">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-[var(--news-ink)] hover:text-[var(--news-accent)] transition font-bold uppercase tracking-widest text-xs">
                        <ArrowLeft size={16} className="mr-2" /> Back to Archives
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--news-ink)] text-[var(--news-paper)] border-2 border-[var(--news-ink)] hover:bg-[var(--news-accent)] hover:border-[var(--news-accent)] transition shadow-sm uppercase text-[10px] font-bold tracking-widest"
                        >
                            <Download size={14} /> Print Edition
                        </button>
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent text-[var(--news-ink)] border-2 border-[var(--news-ink)] hover:bg-[var(--news-border)] disabled:opacity-50 transition shadow-sm uppercase text-[10px] font-bold tracking-widest"
                        >
                            <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                    </div>
                </div>

                <div className="space-y-10 max-w-2xl mx-auto pb-20">

                    {/* Formatting Controls */}
                    <div className="bg-[var(--news-card)] p-6 border border-[var(--news-border)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--news-border)] pb-3 mb-2">
                            <div className="flex items-center gap-2 text-[var(--news-ink)] font-bold uppercase tracking-widest text-sm">
                                <LayoutTemplate size={18} />
                                <span>Typesetting</span>
                            </div>
                            <button
                                onClick={applyCompactMode}
                                className="text-[10px] bg-[var(--news-silver)] text-[var(--news-ink)] px-3 py-1 font-bold uppercase tracking-wider hover:bg-[var(--news-border)] transition flex items-center gap-1 border border-[var(--news-ink)]"
                            >
                                <Minimize2 size={12} /> Compact
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Text Size */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555] uppercase flex justify-between tracking-widest">
                                    Font Size <span>{textSize}pt</span>
                                </label>
                                <input
                                    type="range"
                                    min="9"
                                    max="14"
                                    step="0.5"
                                    value={textSize}
                                    onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-[var(--news-border)] rounded-none appearance-none cursor-pointer accent-[var(--news-ink)]"
                                />
                            </div>

                            {/* Line Height */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555] uppercase flex justify-between tracking-widest">
                                    Leading <span>{lineHeight}x</span>
                                </label>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.1"
                                    value={lineHeight}
                                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-[var(--news-border)] rounded-none appearance-none cursor-pointer accent-[var(--news-ink)]"
                                />
                            </div>

                            {/* Section Spacing */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555] uppercase flex justify-between tracking-widest">
                                    Spacing <span>{sectionSpacing}rem</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.25"
                                    value={sectionSpacing}
                                    onChange={(e) => setSectionSpacing(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-[var(--news-border)] rounded-none appearance-none cursor-pointer accent-[var(--news-ink)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resume Title */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--news-ink)] mb-2 uppercase tracking-widest">Edition Title</label>
                        <input
                            type="text"
                            value={resume.title}
                            onChange={(e) => setResume({ ...resume, title: e.target.value })}
                            className="input-field"
                            placeholder="e.g. Senior Full Stack Engineer"
                        />
                    </div>

                    {/* Personal Info */}
                    <div className="section-container">
                        <h2 className="section-title">Personal Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Full Name"
                                className="input-field"
                                value={resume.personalInfo.fullName || ''}
                                onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)}
                            />
                            <input
                                placeholder="Email"
                                className="input-field"
                                value={resume.personalInfo.email || ''}
                                onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                            />
                            <input
                                placeholder="Phone"
                                className="input-field"
                                value={resume.personalInfo.phone || ''}
                                onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                            />
                            <input
                                placeholder="City, State"
                                className="input-field"
                                value={resume.personalInfo.address || ''}
                                onChange={(e) => handleChange('personalInfo', 'address', e.target.value)}
                            />
                            <input
                                placeholder="LinkedIn URL"
                                className="input-field"
                                value={resume.personalInfo.linkedin || ''}
                                onChange={(e) => handleChange('personalInfo', 'linkedin', e.target.value)}
                            />
                            <input
                                placeholder="Portfolio Website"
                                className="input-field"
                                value={resume.personalInfo.website || ''}
                                onChange={(e) => handleChange('personalInfo', 'website', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="section-container relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="section-title">Objective</h2>
                            <button
                                onClick={generateSummaryAI}
                                disabled={aiGenerating}
                                className="ai-button"
                            >
                                <Wand2 size={12} /> {aiGenerating ? 'Writing...' : 'Auto-Write'}
                            </button>
                        </div>
                        <textarea
                            rows="4"
                            className="input-field resize-y"
                            placeholder="Briefly describe your objectives and professional background..."
                            value={resume.summary || ''}
                            onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                        />
                    </div>

                    {/* Education */}
                    <div className="section-container">
                        <h2 className="section-title">Education</h2>
                        {resume.education.map((edu, index) => (
                            <div key={index} className={`item-card group ${edu.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleArrayChange('education', index, 'hidden', !edu.hidden)}
                                        className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                        title={edu.hidden ? "Show in Resume" : "Hide from Resume"}
                                    >
                                        {edu.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => removeItem('education', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
                                    <input
                                        placeholder="University/College"
                                        className="input-field font-bold"
                                        value={edu.institution || ''}
                                        onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                                    />
                                    <input
                                        placeholder="Degree & Major"
                                        className="input-field"
                                        value={edu.degree || ''}
                                        onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        placeholder="Start Date"
                                        className="input-field"
                                        value={edu.startDate || ''}
                                        onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                                    />
                                    <input
                                        placeholder="End Date"
                                        className="input-field"
                                        value={edu.endDate || ''}
                                        onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                                    />
                                </div>
                                <textarea
                                    className="input-field mt-3 text-sm h-20"
                                    placeholder="Relevant Coursework..."
                                    value={edu.description || ''}
                                    onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                        <button onClick={() => addItem('education', { institution: '', degree: '', startDate: '', endDate: '', description: '', hidden: false })} className="add-btn">
                            <Plus size={16} /> Add Institution
                        </button>
                    </div>

                    {/* Skills */}
                    <div className="section-container">
                        <h2 className="section-title">Skills</h2>
                        <div className="space-y-3">
                            {resume.skills.map((skill, index) => (
                                <div key={index} className={`item-card group relative py-6 px-5 mb-4 border border-[var(--news-border)] bg-white shadow-sm hover:shadow-md transition ${skill.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleArrayChange('skills', index, 'hidden', !skill.hidden)}
                                            className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                            title={skill.hidden ? "Show in Resume" : "Hide from Resume"}
                                        >
                                            {skill.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button onClick={() => removeItem('skills', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-2">Category</label>
                                            <input
                                                placeholder="e.g. Technical"
                                                className="input-field"
                                                value={skill.level || ''}
                                                onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-2">Skills List</label>
                                            <input
                                                placeholder="Enter skills separated by commas..."
                                                className="input-field"
                                                value={skill.name || ''}
                                                onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addItem('skills', { name: '', level: 'Technical', hidden: false })} className="add-btn mt-4">
                            <Plus size={16} /> Add Skill Set
                        </button>
                    </div>

                    {/* Experience */}
                    <div className="section-container">
                        <h2 className="section-title">Experience</h2>
                        {resume.experience.map((exp, index) => (
                            <div key={index} className={`item-card group ${exp.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleArrayChange('experience', index, 'hidden', !exp.hidden)}
                                        className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                        title={exp.hidden ? "Show in Resume" : "Hide from Resume"}
                                    >
                                        {exp.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => removeItem('experience', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
                                    <input
                                        placeholder="Company Name"
                                        className="input-field font-bold"
                                        value={exp.company || ''}
                                        onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                                    />
                                    <input
                                        placeholder="Job Title"
                                        className="input-field"
                                        value={exp.position || ''}
                                        onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        placeholder="Start Date"
                                        className="input-field"
                                        value={exp.startDate || ''}
                                        onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                                    />
                                    <input
                                        placeholder="End Date"
                                        className="input-field"
                                        value={exp.endDate || ''}
                                        onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] text-[#555] uppercase font-bold tracking-widest">Description</label>
                                        <button
                                            onClick={() => improveTextAI(exp.description, 'experience', index, 'description')}
                                            className="ai-button"
                                        >
                                            <Wand2 size={10} /> Edit Copy
                                        </button>
                                    </div>
                                    <textarea
                                        rows="5"
                                        className="input-field text-sm"
                                        placeholder="• Achieved X% growth...&#10;• Led team of..."
                                        value={exp.description || ''}
                                        onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '', hidden: false })} className="add-btn">
                            <Plus size={16} /> Add Experience
                        </button>
                    </div>

                    {/* Projects */}
                    <div className="section-container">
                        <h2 className="section-title">Projects</h2>
                        {resume.projects.map((proj, index) => (
                            <div key={index} className={`item-card group ${proj.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleArrayChange('projects', index, 'hidden', !proj.hidden)}
                                        className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                        title={proj.hidden ? "Show in Resume" : "Hide from Resume"}
                                    >
                                        {proj.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => removeItem('projects', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
                                    <input
                                        placeholder="Project Name"
                                        className="input-field font-bold"
                                        value={proj.name || ''}
                                        onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                                    />
                                    <input
                                        placeholder="Technolgies"
                                        className="input-field"
                                        value={proj.technologies || ''}
                                        onChange={(e) => handleArrayChange('projects', index, 'technologies', e.target.value)}
                                    />
                                </div>
                                <input
                                    placeholder="Project Link"
                                    className="input-field mb-3"
                                    value={proj.link || ''}
                                    onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)}
                                />
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] text-[#555] uppercase font-bold tracking-widest">Description</label>
                                        <button
                                            onClick={() => improveTextAI(proj.description, 'projects', index, 'description')}
                                            className="ai-button transition-all"
                                        >
                                            <Wand2 size={10} /> Edit Copy
                                        </button>
                                    </div>
                                    <textarea
                                        rows="3"
                                        className="input-field text-sm"
                                        placeholder="Describe the project and your role..."
                                        value={proj.description || ''}
                                        onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addItem('projects', { name: '', description: '', technologies: '', link: '', hidden: false })} className="add-btn">
                            <Plus size={16} /> Add Project
                        </button>
                    </div>

                    {/* Responsibilities */}
                    <div className="section-container">
                        <h2 className="section-title">Positions of Responsibility</h2>
                        {resume.responsibilities?.map((resp, index) => (
                            <div key={index} className={`item-card group ${resp.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleArrayChange('responsibilities', index, 'hidden', !resp.hidden)}
                                        className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                        title={resp.hidden ? "Show in Resume" : "Hide from Resume"}
                                    >
                                        {resp.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => removeItem('responsibilities', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
                                    <input
                                        placeholder="Role/Position"
                                        className="input-field font-bold"
                                        value={resp.role || ''}
                                        onChange={(e) => handleArrayChange('responsibilities', index, 'role', e.target.value)}
                                    />
                                    <input
                                        placeholder="Organization"
                                        className="input-field"
                                        value={resp.organization || ''}
                                        onChange={(e) => handleArrayChange('responsibilities', index, 'organization', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        placeholder="Start Date"
                                        className="input-field"
                                        value={resp.startDate || ''}
                                        onChange={(e) => handleArrayChange('responsibilities', index, 'startDate', e.target.value)}
                                    />
                                    <input
                                        placeholder="End Date"
                                        className="input-field"
                                        value={resp.endDate || ''}
                                        onChange={(e) => handleArrayChange('responsibilities', index, 'endDate', e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] text-[#555] uppercase font-bold tracking-widest">Description</label>
                                        <button
                                            onClick={() => improveTextAI(resp.description, 'responsibilities', index, 'description')}
                                            className="ai-button transition-all"
                                        >
                                            <Wand2 size={10} /> Edit Copy
                                        </button>
                                    </div>
                                    <textarea
                                        className="input-field text-sm"
                                        rows="3"
                                        placeholder="Describe your impact..."
                                        value={resp.description || ''}
                                        onChange={(e) => handleArrayChange('responsibilities', index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addItem('responsibilities', { role: '', organization: '', startDate: '', endDate: '', description: '', hidden: false })} className="add-btn">
                            <Plus size={16} /> Add Responsibility
                        </button>
                    </div>

                    {/* Achievements */}
                    <div className="section-container">
                        <h2 className="section-title">Achievements</h2>
                        {resume.achievements?.map((ach, index) => (
                            <div key={index} className={`item-card group ${ach.hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleArrayChange('achievements', index, 'hidden', !ach.hidden)}
                                        className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[var(--news-ink)] hover:bg-[var(--news-silver)] transition"
                                        title={ach.hidden ? "Show in Resume" : "Hide from Resume"}
                                    >
                                        {ach.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => removeItem('achievements', index)} className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)] text-[#555] hover:text-[#b91c1c] hover:border-[#b91c1c] transition" title="Remove">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
                                    <input
                                        placeholder="Title/Honor"
                                        className="input-field font-bold"
                                        value={ach.title || ''}
                                        onChange={(e) => handleArrayChange('achievements', index, 'title', e.target.value)}
                                    />
                                    <input
                                        placeholder="Date"
                                        className="input-field"
                                        value={ach.date || ''}
                                        onChange={(e) => handleArrayChange('achievements', index, 'date', e.target.value)}
                                    />
                                </div>
                                <textarea
                                    className="input-field text-sm"
                                    rows="2"
                                    placeholder="Brief description..."
                                    value={ach.description || ''}
                                    onChange={(ach_e) => handleArrayChange('achievements', index, 'description', ach_e.target.value)}
                                />
                            </div>
                        ))}
                        <button onClick={() => addItem('achievements', { title: '', date: '', description: '', hidden: false })} className="add-btn">
                            <Plus size={16} /> Add Achievement
                        </button>
                    </div>

                </div>
            </div>

            {/* Right Sidebar - Live Preview */}
            <div className="w-full md:w-1/2 h-full bg-[var(--news-silver)] overflow-y-auto p-8 flex justify-center border-l border-[var(--news-border)]">
                <div
                    id="resume-preview"
                    className="bg-white shadow-2xl w-[215.9mm] min-h-[279.4mm] p-[10mm] text-black printable-area origin-top transition-all ease-in-out duration-300 relative"
                    style={{
                        fontSize: `${textSize}pt`,
                        lineHeight: lineHeight
                    }}
                >
                    {/* Watermark/Texture overlay for preview only */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>

                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="font-bold uppercase tracking-wide mb-1 font-serif" style={{ fontSize: '2.2em' }}>{resume.personalInfo.fullName || 'YOUR NAME'}</h1>
                        <div className="flex flex-col items-center gap-0.5 font-serif text-gray-800" style={{ fontSize: '0.9em' }}>
                            {resume.personalInfo.address && <span>{resume.personalInfo.address}</span>}
                            <div className="flex gap-3 justify-center">
                                {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                                {resume.personalInfo.email && <span className="text-black">{resume.personalInfo.email}</span>}
                                {resume.personalInfo.linkedin && (
                                    <a href={resume.personalInfo.linkedin} className="text-black no-underline">{resume.personalInfo.linkedin.replace(/^https?:\/\//, '')}</a>
                                )}
                                {resume.personalInfo.website && (
                                    <a href={resume.personalInfo.website} className="text-black no-underline">{resume.personalInfo.website.replace(/^https?:\/\//, '')}</a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Objective */}
                    {resume.summary && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">OBJECTIVE</h3>
                            <p className="section-content text-justify">{resume.summary}</p>
                        </div>
                    )}

                    {/* Education */}
                    {resume.education?.filter(edu => !edu.hidden).length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">Education</h3>
                            {resume.education.filter(edu => !edu.hidden).map((edu, i) => (
                                <div key={i} className="mb-2">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold font-serif" style={{ fontSize: '1.1em' }}>{edu.institution}</div>
                                        <div className="font-serif italic text-right" style={{ fontSize: '0.9em' }}>{edu.endDate ? `Expected ${edu.endDate}` : ''}</div>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-serif font-bold" style={{ fontSize: '0.95em' }}>{edu.degree}</div>
                                        <div className="font-serif" style={{ fontSize: '0.9em' }}>{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                    {edu.description && <p className="mt-1 text-gray-700 font-serif" style={{ fontSize: '0.85em' }}>{edu.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {resume.skills?.filter(skill => !skill.hidden).length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">SKILLS</h3>
                            <div className="flex flex-col gap-2">
                                {resume.skills.filter(skill => !skill.hidden).map((skill, i) => (
                                    <div key={i} className="flex flex-col">
                                        <div className="font-bold font-serif" style={{ fontSize: '1.0em' }}>{skill.level}</div>
                                        <div className="text-gray-800 font-serif" style={{ fontSize: '0.9em' }}>{skill.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {resume.experience?.length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">EXPERIENCE</h3>
                            {resume.experience.filter(exp => !exp.hidden).map((exp, i) => (
                                <div key={i} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <div className="font-bold font-serif" style={{ fontSize: '1.1em' }}>{exp.position}</div>
                                        <div className="font-serif" style={{ fontSize: '0.9em' }}>{exp.startDate} - {exp.endDate}</div>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="font-serif italic" style={{ fontSize: '0.95em' }}>{exp.company}</div>
                                        <div className="font-serif italic text-right" style={{ fontSize: '0.95em' }}>Location</div>
                                    </div>
                                    <div className="font-serif pl-0" style={{ fontSize: '0.95em' }}>
                                        <ul className="list-disc ml-4 space-y-0.5 marker:text-black">
                                            {exp.description.split('\n').map((line, idx) => (
                                                line.trim().replace(/^•\s*/, '') && <li key={idx} className="pl-0 text-justify">{line.trim().replace(/^•\s*/, '')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {resume.projects?.length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">PROJECTS</h3>
                            <div className="space-y-3">
                                {resume.projects.filter(proj => !proj.hidden).map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex items-baseline mb-0.5">
                                            <span className="font-bold font-serif mr-2" style={{ fontSize: '1em' }}>{proj.name}</span>
                                            {proj.technologies && <span className="font-serif italic text-xs text-gray-700">| {proj.technologies}</span>}
                                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="ml-auto text-blue-800 underline font-serif" style={{ fontSize: '0.8em' }}>(Link)</a>}
                                        </div>
                                        <div className="font-serif pl-0" style={{ fontSize: '0.95em' }}>
                                            <p className="text-justify mb-0.5">{proj.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {resume.responsibilities?.filter(resp => !resp.hidden).length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">Positions of Responsibility</h3>
                            {resume.responsibilities.filter(resp => !resp.hidden).map((resp, i) => (
                                <div key={i} className="mb-3">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <div className="font-bold font-serif" style={{ fontSize: '1.05em' }}>{resp.role}</div>
                                        <div className="font-serif italic" style={{ fontSize: '0.9em' }}>{resp.startDate} - {resp.endDate}</div>
                                    </div>
                                    <div className="font-serif italic mb-0.5" style={{ fontSize: '0.95em' }}>{resp.organization}</div>
                                    <p className="section-content text-justify">{resp.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Achievements */}
                    {resume.achievements?.filter(ach => !ach.hidden).length > 0 && (
                        <div style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h3 className="section-header">ACHIEVEMENTS</h3>
                            <ul className="list-disc ml-4 space-y-1 font-serif marker:text-black" style={{ fontSize: '0.95em' }}>
                                {resume.achievements.filter(ach => !ach.hidden).map((ach, i) => (
                                    <li key={i} className="pl-0">
                                        <span className="font-bold">{ach.title}</span> {ach.date && <span>({ach.date})</span>}
                                        {ach.description && <span className="ml-1 text-gray-700">| {ach.description}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .section-container {
                    background-color: var(--news-card);
                    padding: 1.5rem;
                    border: 1px solid var(--news-border);
                    box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                }
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--news-ink);
                    margin-bottom: 1.5rem;
                    font-family: 'Playfair Display', serif;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid var(--news-ink);
                    padding-bottom: 0.5rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--news-border);
                    border-radius: 0;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 1rem;
                    font-family: 'Courier Prime', monospace;
                    background-color: var(--news-paper);
                    color: var(--news-ink);
                }
                .input-field:focus {
                    border-color: var(--news-ink);
                    background-color: #fff;
                    box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.1);
                }
                input[type="range"] {
                    accent-color: var(--news-ink);
                }
                .add-btn {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px dashed var(--news-border);
                    border-radius: 0;
                    color: #555;
                    font-weight: 700;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    font-family: 'Old Standard TT', serif;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.8em;
                }
                .add-btn:hover {
                    border-color: var(--news-ink);
                    color: var(--news-ink);
                    background-color: var(--news-silver);
                }
                .delete-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    color: #555;
                    transition: opacity 0.2s;
                    opacity: 0;
                    background: var(--news-paper);
                    padding: 4px;
                    border: 1px solid var(--news-border);
                }
                .delete-btn:hover {
                    color: #b91c1c;
                    border-color: #b91c1c;
                }
                .item-card {
                    background: #fff;
                    padding: 1.5rem;
                    border: 1px solid var(--news-border);
                    margin-bottom: 1.5rem;
                    position: relative;
                }
                .ai-button {
                    font-size: 0.65rem;
                    background: linear-gradient(135deg, #d1d5db 0%, #e5e7eb 50%, #fdf9f2 100%);
                    color: #444;
                    padding: 0.4rem 0.8rem;
                    border-radius: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    transition: all 0.3s ease;
                    border: 1px solid #c0c0c0;
                    box-shadow: 1px 1px 0px 0px rgba(0,0,0,0.1);
                }
                .ai-button:hover {
                    background: linear-gradient(135deg, #e5e7eb 0%, #fdf9f2 50%, #ffffff 100%);
                    border-color: #999;
                    transform: translateY(-1px);
                    box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.15);
                }
                .ai-button svg {
                    color: #9333ea;
                    filter: drop-shadow(0 0 1px rgba(147, 51, 234, 0.4));
                }
                .ai-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* Preview Styles mimicking LaTeX */
                .font-serif {
                    font-family: 'Times New Roman', Times, serif;
                }
                .section-header {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 0.9em;
                    font-weight: bold;
                    text-transform: uppercase;
                    border-bottom: 1px solid #000;
                    margin-bottom: 0.5em;
                    padding-bottom: 0.1em;
                    letter-spacing: 0.05em;
                }
                .section-content {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 0.95em;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
};

export default Editor;
