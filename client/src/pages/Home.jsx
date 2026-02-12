import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, FileText, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Home = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const { firstName, lastName, email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isLogin
                ? 'http://localhost:5000/api/auth/login'
                : 'http://localhost:5000/api/auth/register';

            const res = await axios.post(url, formData);

            if (res.data) {
                localStorage.setItem('resume_builder_token', res.data.token);
                localStorage.setItem('resume_builder_user_id', res.data._id);
                toast.success(isLogin ? "Welcome back, Editor." : "Registration successful.");
                setTimeout(() => navigate('/dashboard'), 500);
            }
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Authentication failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--news-paper)] text-[var(--news-ink)] overflow-x-hidden font-serif w-full">
            {/* Newspaper Header - More Compact */}
            <header className="px-6 py-4 w-full border-b-2 border-[var(--news-ink)] bg-[var(--news-paper)]">
                <div className="flex items-end justify-between border-b border-[var(--news-border)] pb-2 mb-2">
                    <div className="uppercase tracking-[0.2em] text-[10px] font-bold text-[#666]">Est. {new Date().getFullYear()}</div>
                    <div className="uppercase tracking-[0.2em] text-[10px] font-bold text-[#666]">NITW Edition</div>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-1 font-serif text-[var(--news-ink)]">
                        The Curriculum Vitae
                    </h1>
                    <div className="flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-[#444] mt-2 border-t border-b border-[var(--news-border)] py-1 mx-auto w-full">
                        <span>Vol. I</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>Free Access</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow px-8 pb-8 w-full max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">

                    {/* LEFT COLUMN: About & AI (8 cols) - Background Lite Lite Brown */}
                    <div className="lg:col-span-8 flex flex-col pr-0 lg:pr-8 pt-4">
                        <div className="mb-6">
                            <h2 className="text-4xl md:text-6xl font-bold leading-none mb-4 text-[var(--news-ink)] uppercase tracking-tight">
                                Professionals Pivot to <br />
                                <span className="italic font-serif text-[var(--news-accent)] normal-case">Intelligent Resumes</span>
                            </h2>
                            <div className="flex gap-6 items-start">
                                <p className="text-lg font-serif leading-relaxed mb-6 italic text-[#444] border-l-4 border-[var(--news-silver)] pl-4 w-2/3">
                                    "A definitive upgrade for the modern career," experts confirm. The new AI-driven engine refines professional histories into compelling narratives.
                                </p>
                                <div className="w-1/3 bg-[var(--news-silver)] p-4 text-center border border-[var(--news-border)] hidden md:block">
                                    <span className="block text-2xl font-bold mb-1">98%</span>
                                    <span className="text-xs uppercase tracking-widest">Efficiency Boost</span>
                                </div>
                            </div>

                            <div className="newspaper-columns text-justify text-base leading-relaxed space-y-4 text-[#222] pr-4">
                                <p>
                                    <span className="float-left text-5xl font-black mr-2 mt-[-8px] uppercase">I</span>
                                    n a landscape dominated by digital competition, clarity is currency. "Vitae," the new standard in document preparation, leverages advanced algorithms to strip away the superfluous and highlight the essential.
                                </p>
                                <p>
                                    Why struggle with formatting? The system's <strong>Smart Editor</strong> engages with your content directly, suggesting impactful verbs and restructuring awkward phrasing. It is less of a tool and more of a dedicated copy-editor, working tirelessly to ensure your professional story is told with precision.
                                </p>
                                <p>
                                    Design matters. By utilizing classic typographic principles—serif fonts, proper leading, and balanced whitespace—the output commands respect. It whispers authority rather than shouting for attention.
                                </p>
                            </div>
                        </div>

                        {/* Feature Highlights - Silver Background Strip */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto border-t-2 border-[var(--news-ink)] pt-4">
                            <div className="border border-[var(--news-border)] p-4 bg-white shadow-sm">
                                <h4 className="font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2 text-[var(--news-accent)]">
                                    <PenTool size={14} /> AI Suggestions
                                </h4>
                                <p className="text-xs leading-relaxed text-[#444]">
                                    Real-time content analysis offers actionable improvements for every section of your resume.
                                </p>
                            </div>
                            <div className="border border-[var(--news-border)] p-4 bg-white shadow-sm">
                                <h4 className="font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2 text-[var(--news-accent)]">
                                    <FileText size={14} /> Print Ready
                                </h4>
                                <p className="text-xs leading-relaxed text-[#444]">
                                    Export perfectly formatted PDFs that maintain their integrity across all devices and printers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Login Form (4 cols) - Silver Background */}
                    <div className="lg:col-span-4 flex flex-col bg-[var(--news-silver)] border-l-2 border-[var(--news-ink)] p-6 relative">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--news-ink)]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--news-ink)]"></div>

                        <div className="flex-grow flex flex-col justify-center">
                            <div className="bg-[var(--news-card)] border-2 border-[var(--news-ink)] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] relative z-10">
                                <div className="text-center mb-6">
                                    <div className="inline-block bg-[var(--news-ink)] text-[var(--news-paper)] text-[10px] font-bold px-3 py-1 uppercase tracking-widest mb-3">
                                        Subscriber Only
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-1 text-[var(--news-ink)]">
                                        {isLogin ? 'Editor Login' : 'New Account'}
                                    </h3>
                                    <div className="h-px w-16 bg-[var(--news-border)] mx-auto my-2"></div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!isLogin && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={firstName}
                                                    onChange={onChange}
                                                    placeholder="First Name"
                                                    className="w-full p-2 text-sm border border-[var(--news-border)] bg-white focus:border-[var(--news-ink)] outline-none font-serif placeholder:italic"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={lastName}
                                                    onChange={onChange}
                                                    placeholder="Last Name"
                                                    className="w-full p-2 text-sm border border-[var(--news-border)] bg-white focus:border-[var(--news-ink)] outline-none font-serif placeholder:italic"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-3 text-[#888]" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={onChange}
                                            className="w-full pl-9 p-2 text-sm border border-[var(--news-border)] bg-white focus:border-[var(--news-ink)] outline-none font-serif"
                                            placeholder="Email Address"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-3 text-[#888]" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={password}
                                            onChange={onChange}
                                            className="w-full pl-9 p-2 text-sm border border-[var(--news-border)] bg-white focus:border-[var(--news-ink)] outline-none font-serif"
                                            placeholder="Password"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2 bg-[var(--news-ink)] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#333] transition flex justify-center items-center gap-2 mt-2 border-2 border-transparent hover:border-black shadow-sm"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? "Sign In" : "Register")}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setFormData({ firstName: '', lastName: '', email: '', password: '' });
                                        }}
                                        className="text-[var(--news-accent)] hover:text-black text-xs uppercase font-bold underline decoration-1 underline-offset-2 transition"
                                    >
                                        {isLogin ? "Need an account? Subscribe" : "Have an account? Login"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center px-4">
                            <p className="text-[10px] uppercase tracking-widest text-[#666]">
                                Secured by <span className="font-bold text-black">OldStandard Security</span>
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Home;
