import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, Plus, Trash2, Loader2, User, Upload, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    // Get or Create a User ID from LocalStorage for guest usage
    useEffect(() => {
        let storedUserId = localStorage.getItem('resume_builder_user_id');
        if (!storedUserId) {
            storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('resume_builder_user_id', storedUserId);
        }
        setUserId(storedUserId);
        fetchResumes(storedUserId);
    }, []);

    const fetchResumes = async (uid) => {
        try {
            const res = await api.get(`/api/resumes?userId=${uid}`);
            setResumes(res.data);
        } catch (error) {
            console.error("Error fetching resumes:", error);
        } finally {
            setLoading(false);
        }
    };

    const createResume = async () => {
        try {
            const res = await api.post('/api/resumes', {
                userId,
                title: 'New Edition'
            });
            navigate(`/editor/${res.data._id}`);
        } catch (error) {
            console.error("Error creating resume:", error);
        }
    };

    const deleteResume = async (e, id) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to discard this document?")) return;

        try {
            await api.delete(`/api/resumes/${id}`);
            setResumes(resumes.filter(r => r._id !== id));
        } catch (error) {
            console.error("Error deleting resume:", error);
        }
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('resume_builder_token');
            localStorage.removeItem('resume_builder_user_id');
            toast.success("Logged out successfully");
            navigate('/');
        }
    };

    return (
        <div className="w-full min-h-screen bg-[var(--news-paper)] text-[var(--news-ink)] font-serif px-6 py-8">
            <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-[var(--news-ink)] pb-4 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--news-ink)] leading-none">The Archives</h1>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold uppercase tracking-widest text-[#666]">
                        <span className="bg-[var(--news-silver)] px-2 py-1">User: {userId.substring(0, 8)}</span>
                        <span>{resumes.length} Documents</span>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleLogout}
                        className="mr-2 text-[10px] font-bold uppercase tracking-widest text-[#888] hover:text-[#b91c1c] transition border-b border-transparent hover:border-[#b91c1c]"
                    >
                        Log Out
                    </button>
                    <button
                        onClick={createResume}
                        className="flex items-center gap-2 px-5 py-2 bg-[var(--news-ink)] text-[var(--news-paper)] border border-[var(--news-ink)] hover:bg-[#333] transition uppercase tracking-widest text-[10px] font-bold shadow-sm"
                    >
                        <Plus size={14} /> New Edition
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-[var(--news-ink)]" size={48} />
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT: Resume Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Create New Card */}
                            <div
                                onClick={createResume}
                                className="group border-2 border-dashed border-[var(--news-border)] bg-[var(--news-silver)] p-6 flex flex-col items-center justify-center text-[#666] hover:border-[var(--news-ink)] hover:text-[var(--news-ink)] hover:bg-[#d4d4d4] transition cursor-pointer min-h-[240px]"
                            >
                                <div className="mb-3 p-3 rounded-none border border-current bg-white">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold uppercase tracking-widest text-xs text-center">Start New Draft</span>
                            </div>

                            {/* Resume Cards */}
                            {resumes.map(resume => (
                                <div
                                    key={resume._id}
                                    className="bg-white p-6 shadow-sm border border-[var(--news-border)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-[var(--news-ink)] transition duration-200 relative group flex flex-col min-h-[240px]"
                                >
                                    <Link to={`/editor/${resume._id}`} className="absolute inset-0 z-0" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-1.5 border border-[var(--news-border)] bg-[var(--news-paper)]">
                                            <FileText size={20} className="text-[var(--news-ink)]" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#888]">
                                            {new Date(resume.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-xl text-[var(--news-ink)] mb-2 leading-tight font-serif uppercase z-10 truncate pr-2">
                                        {resume.title || 'Untitled Draft'}
                                    </h3>
                                    <p className="text-xs font-serif text-[#666] italic mb-4 line-clamp-4 leading-relaxed border-l-2 border-[var(--news-silver)] pl-3">
                                        {resume.summary || 'A professional summary of qualifications and experience suited for a variety of roles...'}
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-[var(--news-silver)] flex justify-between items-center z-20">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--news-accent)] group-hover:text-black hover:underline cursor-pointer">
                                            Open Editor
                                        </span>
                                        <button
                                            onClick={(e) => deleteResume(e, resume._id)}
                                            className="text-[#999] hover:text-[#b71c1c] transition p-1 hover:bg-[#fee2e2]"
                                            title="Discard"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Backend Infrastructure Report */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="border-t-4 border-[var(--news-ink)] pt-1">
                            <div className="border border-[var(--news-border)] bg-[var(--news-card)] p-5 shadow-sm">
                                <h3 className="font-black uppercase tracking-tight text-lg mb-4 text-[var(--news-ink)] border-b border-[var(--news-border)] pb-2">
                                    SERVER
                                </h3>


                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-xs font-serif">
                                        <span className="text-[#555]">Server Status</span>
                                        <span className="flex items-center gap-1 font-bold text-green-700 uppercase tracking-wider">
                                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Online
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-serif">
                                        <span className="text-[#555]">Runtime</span>
                                        <span className="font-bold text-[var(--news-ink)]">Node.js v20 LTS</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-serif">
                                        <span className="text-[#555]">Framework</span>
                                        <span className="font-bold text-[var(--news-ink)]">Express.js 4.19</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-serif">
                                        <span className="text-[#555]">Database</span>
                                        <span className="font-bold text-[var(--news-ink)]">MongoDB Atlas</span>
                                    </div>
                                    {/*<div className="flex justify-between items-center text-xs font-serif">
                                        <span className="text-[#555]">AI Model</span>
                                        <span className="font-bold text-[var(--news-ink)]">Gemini Flash (Stable)</span>
                                    </div> */}
                                </div>

                                {/*
                    
                                <h4 className="font-bold uppercase tracking-widest text-xs mb-3 text-[var(--news-accent)]">Security & Core</h4>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex justify-between text-[10px] border-b border-[var(--news-silver)] pb-1">
                                        <span className="text-[#555]">Authentication</span>
                                        <span className="font-bold">JWT (Bearer)</span>
                                    </li>
                                    <li className="flex justify-between text-[10px] border-b border-[var(--news-silver)] pb-1">
                                        <span className="text-[#555]">Encryption</span>
                                        <span className="font-bold">Bcrypt Hashing</span>
                                    </li>
                                    <li className="flex justify-between text-[10px] border-b border-[var(--news-silver)] pb-1">
                                        <span className="text-[#555]">CORS Policy</span>
                                        <span className="font-bold">Enabled</span>
                                    </li>
                                </ul>


                                
                                <h4 className="font-bold uppercase tracking-widest text-xs mb-3 text-[var(--news-accent)]">Active Endpoints</h4>
                                <ul className="space-y-2">
                                    <li className="flex flex-col border-l-2 border-[var(--news-silver)] pl-2">
                                        <code className="text-[10px] font-bold text-[var(--news-ink)]">GET /api/resumes</code>
                                        <span className="text-[10px] text-[#666] italic">Fetch User Archives</span>
                                    </li>
                                    <li className="flex flex-col border-l-2 border-[var(--news-silver)] pl-2">
                                        <code className="text-[10px] font-bold text-[var(--news-ink)]">POST /api/auth/login</code>
                                        <span className="text-[10px] text-[#666] italic">JWT Token Issue</span>
                                    </li>
                                    <li className="flex flex-col border-l-2 border-[var(--news-silver)] pl-2">
                                        <code className="text-[10px] font-bold text-[var(--news-ink)]">POST /api/auth/register</code>
                                        <span className="text-[10px] text-[#666] italic">New Editor Enrollment</span>
                                    </li>
                                    <li className="flex flex-col border-l-2 border-[var(--news-silver)] pl-2">
                                        <code className="text-[10px] font-bold text-[var(--news-ink)]">POST /api/ai/generate-summary</code>
                                        <span className="text-[10px] text-[#666] italic">Professional Summary Engine</span>
                                    </li>
                                    <li className="flex flex-col border-l-2 border-[var(--news-silver)] pl-2">
                                        <code className="text-[10px] font-bold text-[var(--news-ink)]">POST /api/ai/improve-text</code>
                                        <span className="text-[10px] text-[#666] italic">Neural Text Refinement</span>
                                    </li>
                                </ul>

                                <div className="mt-6 pt-4 border-t border-dashed border-[var(--news-border)] text-center">
                                    <p className="text-[9px] uppercase tracking-widest text-[#888]">
                                        System Telemetry v2.1
                                    </p>
                                </div> 
                             */}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Dashboard;
