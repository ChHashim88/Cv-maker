import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  LogIn,
  LogOut,
  FileText,
  Eye,
  Sliders,
  Palette,
  Check,
  FolderOpen,
  Database,
  Loader2,
  Code2,
  Cpu,
  CloudLightning,
  TrendingUp,
  Globe,
  Map,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSupabaseClient } from './lib/supabase';

// Global declaration for html2pdf.js loaded dynamically
declare global {
  interface Window {
    html2pdf: any;
  }
}

// -------------------------------------------------------------
// CONSTANTS & TEMPLATES
// -------------------------------------------------------------
const ROLE_SKILLS: Record<string, string[]> = {
  frontend: ["html", "css", "javascript", "react", "ui", "tailwind", "typescript", "git"],
  backend: ["node", "express", "api", "database", "sql", "mongodb", "graphql", "docker"],
  data: ["python", "sql", "excel", "analysis", "pandas", "tableau", "statistics", "powerbi"]
};

const ROLE_CONTENT: Record<string, { summary: string; experience: string }> = {
  frontend: {
    summary: "Vibrant and detail-oriented Frontend Developer with 3+ years of experience specializing in building highly responsive, accessible, and performant web interfaces. Proficient in React, TypeScript, and Tailwind CSS. Passionate about translating complex designer wireframes into pixel-perfect interactive experiences.",
    experience: "Senior Frontend Engineer • TechCorp Solutions (2024 - Present)\n- Led the frontend migration from a legacy system to a modern React 19 architecture, improving page loading performance by 42%.\n- Authored a reusable design-system component library using Tailwind CSS, reducing design-to-development turnaround time by 50%.\n- Integrated RESTful & GraphQL APIs with optimized global state management structures.\n\nFrontend Developer • WebLabs Agency (2022 - 2024)\n- Developed 15+ custom client websites, incorporating advanced CSS animations and interactive charts.\n- Optimized visual assets and executed strict SEO best practices, boosting website traffic by 30%."
  },
  backend: {
    summary: "Architecturally-focused Backend Developer with a deep expertise in server-side systems, scalable database design, and microservices logic. Skilled in building resilient RESTful & GraphQL APIs using Node.js/Express, managing high-concurrency databases, and writing automated unit testing workflows.",
    experience: "Lead Backend Developer • CloudSystems Inc. (2023 - Present)\n- Architected and deployed microservices powering internal tools, supporting 100,000+ daily active users.\n- Refactored PostgreSQL and MongoDB database query patterns, achieving a 45% reduction in index scanning latency.\n- Supervised safe automated Docker container orchestrations and server CI/CD integrations.\n\nBackend Engineer • DevHive Studio (2021 - 2023)\n- Engineered robust backend architectures and secure JSON Web Token (JWT) user auth endpoints.\n- Wrote comprehensive API integration test suites in Jest, expanding codebase coverage to 88%."
  },
  data: {
    summary: "Analytical and results-driven Data Analyst expert in cleaning, querying, and transforming dense raw data points into clear, strategic business insights. Proficient in advanced SQL, Python analytics libraries, and creating engaging, interactive visualization boards for executive stakeholders.",
    experience: "Senior Business Data Analyst • InsightCo Global (2023 - Present)\n- Engineered automated Python ETL data-ingestion pipelines, trimming manual formatting by 12 hours every week.\n- Constructed visual PowerBI & Tableau executive monitoring dashboards that streamlined regional sales audits.\n- Performed structural database query optimizations, handling up to 10M rows of retail record audits.\n\nData Analyst • QuantLab Corporation (2021 - 2023)\n- Standardized large-scale sheet databases and ran complex regression modeling using Advanced Excel.\n- Drafted comprehensive analytical reports detailing active consumer demographics to drive product direction."
  }
};

const SHOWN_ACCENT_COLORS = [
  { id: 'violet', label: 'Violet Glow', class: 'bg-violet-600 border-violet-400 text-violet-400', hex: '#8b5cf6' },
  { id: 'indigo', label: 'Neon Blue', class: 'bg-indigo-600 border-indigo-400 text-indigo-400', hex: '#6366f1' },
  { id: 'emerald', label: 'Tech Emerald', class: 'bg-emerald-600 border-emerald-400 text-emerald-400', hex: '#10b981' },
  { id: 'cyan', label: 'Cyber Cyan', class: 'bg-cyan-500 border-cyan-400 text-cyan-400', hex: '#06b6d4' },
  { id: 'rose', label: 'Sunset Crimson', class: 'bg-rose-600 border-rose-400 text-rose-400', hex: '#f43f5e' },
  { id: 'pink', label: 'Bubblegum Neon', class: 'bg-pink-500 border-pink-400 text-pink-400', hex: '#ec4899' },
  { id: 'amber', label: 'Cyber Amber', class: 'bg-amber-500 border-amber-400 text-amber-400', hex: '#f59e0b' },
  { id: 'orange', label: 'Vibrant Flare', class: 'bg-orange-500 border-orange-400 text-orange-400', hex: '#f97316' },
  { id: 'black', label: 'Midnight Obsidian', class: 'bg-slate-950 border-slate-700 text-slate-300', hex: '#0f172a' }
];

const parseEducationString = (eduStr: string): Array<{ degree: string; university: string; year: string }> => {
  if (!eduStr.trim()) return [];
  return eduStr.split('\n').map(line => {
    const dotIndex = line.indexOf(' • ');
    if (dotIndex !== -1) {
      const degree = line.substring(0, dotIndex).trim();
      const rest = line.substring(dotIndex + 3).trim();
      
      const lastParenOpen = rest.lastIndexOf('(');
      const lastParenClose = rest.lastIndexOf(')');
      if (lastParenOpen !== -1 && lastParenClose > lastParenOpen) {
        const university = rest.substring(0, lastParenOpen).trim();
        const year = rest.substring(lastParenOpen + 1, lastParenClose).trim();
        return { degree, university, year };
      }
      return { degree, university: rest, year: '' };
    }
    return { degree: line.trim(), university: '', year: '' };
  });
};

export default function App() {
  // -------------------------------------------------------------
  // AUTH STATE
  // -------------------------------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthSignUp, setIsAuthSignUp] = useState<boolean>(false);
  const [isConnectingDb, setIsConnectingDb] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [showWelcomeCard, setShowWelcomeCard] = useState<boolean>(false);

  // -------------------------------------------------------------
  // RESUME FORM STATE
  // -------------------------------------------------------------
  const [name, setName] = useState<string>('Alex Mercer');
  const [email, setEmail] = useState<string>('alex.mercer@skillsync.io');
  const [phone, setPhone] = useState<string>('+1 (555) 019-2834');
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [linkedin, setLinkedin] = useState<string>('linkedin.com/in/alexmercer');
  const [github, setGithub] = useState<string>('github.com/alexmercer');
  const [role, setRole] = useState<string>('frontend');
  const [customRoleName, setCustomRoleName] = useState<string>('AI Engineer');
  const [customRoleSkills, setCustomRoleSkills] = useState<string>('python, pytorch, openai, api, llm, prompt');

  const [skills, setSkills] = useState<string>('html, css, javascript, react, tailwind, typescript');
  const [experience, setExperience] = useState<string>('Lead Frontend Dev at Tech Startup. Engineered sleek responsive dashboards.');
  const [education, setEducation] = useState<string>('B.S. in Computer Science • Stanford University (2018 - 2022)');
  const [educationList, setEducationList] = useState<Array<{ degree: string; university: string; year: string }>>([
    { degree: 'B.S. in Computer Science', university: 'Stanford University', year: '2018 - 2022' }
  ]);

  const updateEducationList = (newList: Array<{ degree: string; university: string; year: string }>) => {
    setEducationList(newList);
    const serialized = newList
      .map(item => {
        const parts = [];
        if (item.degree.trim()) parts.push(item.degree.trim());
        if (item.university.trim()) {
          const univStr = item.university.trim();
          const yearStr = item.year.trim() ? ` (${item.year.trim()})` : '';
          parts.push(`${univStr}${yearStr}`);
        } else if (item.year.trim()) {
          parts.push(`(${item.year.trim()})`);
        }
        return parts.join(' • ');
      })
      .filter(Boolean)
      .join('\n');
    setEducation(serialized);
  };
  const [certifications, setCertifications] = useState<string>('AWS Certified Solutions Architect • Professional Scrum Master');
  const [languages, setLanguages] = useState<string>('English (Native) • Spanish (Conversational)');
  const [awards, setAwards] = useState<string>('TechCorp Developer of the Year (2025) • Stanford Hackathon Winner');

  // Custom added skill input (pill editor helper)
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // -------------------------------------------------------------
  // INTERFACE & THEME STATE
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'experience' | 'extras'>('profile');
  const [resumeTheme, setResumeTheme] = useState<'classic' | 'modern' | 'minimalist' | 'blackontop' | 'worldtop'>('modern');
  const [accentColor, setAccentColor] = useState<string>('violet');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [savedResumesList, setSavedResumesList] = useState<any[]>([]);
  const [showSavedListModal, setShowSavedListModal] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New Creative Pages & Simulator States
  const [currentPage, setCurrentPage] = useState<'builder' | 'intelligence' | 'showroom' | 'demand' | 'pathway'>('builder');
  const [demandQuery, setDemandQuery] = useState<string>('');
  const [isFetchingDemand, setIsFetchingDemand] = useState<boolean>(false);
  const [demandData, setDemandData] = useState<any>(null);
  const [pathwayStart, setPathwayStart] = useState<string>('');
  const [pathwayEnd, setPathwayEnd] = useState<string>('');
  const [isGeneratingPathway, setIsGeneratingPathway] = useState<boolean>(false);
  const [pathwayData, setPathwayData] = useState<any>(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
  const [interviewAnswer, setInterviewAnswer] = useState<string>('');
  const [interviewFeedback, setInterviewFeedback] = useState<string>('');
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState<boolean>(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  // Reference to resume DOM node for PDF export
  const resumeRef = useRef<HTMLDivElement>(null);

  // Show auto-dismiss notifications
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // SUPABASE COMPONENT SETUP & STATE LISTENER
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Get current active session from custom localStorage
    const storedId = localStorage.getItem("skillsync_user_id");
    const storedEmail = localStorage.getItem("skillsync_user_email");

    if (storedId && storedEmail) {
      setIsLoggedIn(true);
      setCurrentUserId(storedId);
      setCurrentUserEmail(storedEmail);
      fetchResumesFromSupabase(storedId, storedEmail);
    }

    // Load active draft resume if it exists
    const draft = localStorage.getItem("skillsync_resume");
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setLinkedin(data.linkedin || '');
        setGithub(data.github || '');
        setRole(data.role || 'frontend');
        setSkills(data.skills || '');
        setExperience(data.experience || '');
        const edu = data.education || '';
        setEducation(edu);
        setEducationList(parseEducationString(edu));
        setCertifications(data.certifications || '');
        setLanguages(data.languages || '');
        setAwards(data.awards || '');
        if (data.accentColor) setAccentColor(data.accentColor);
        if (data.resumeTheme) setResumeTheme(data.resumeTheme);
        if (data.customRoleName) setCustomRoleName(data.customRoleName);
        if (data.customRoleSkills) setCustomRoleSkills(data.customRoleSkills);
      } catch (e) {
        console.error("Error parsing draft resume", e);
      }
    }
  }, []);

  // -------------------------------------------------------------
  // CLEAR RESUME FORM HELPER
  // -------------------------------------------------------------
  const clearResumeForm = (userEmail: string = '') => {
    setName('');
    setEmail(userEmail);
    setPhone('');
    setLocation('');
    setLinkedin('');
    setGithub('');
    setRole('frontend');
    setSkills('');
    setExperience('');
    setEducation('');
    setEducationList([]);
    setCertifications('');
    setLanguages('');
    setAwards('');
    setAccentColor('violet');
    setResumeTheme('modern');
    setCustomRoleName('AI Engineer');
    setCustomRoleSkills('python, pytorch, openai, api, llm, prompt');
  };

  const handleClearCV = () => {
    clearResumeForm(currentUserEmail);
    setShowClearConfirm(false);
    triggerNotification("CV cleared successfully!", "info");
  };

  // -------------------------------------------------------------
  // SUPABASE DATABASE FETCH
  // -------------------------------------------------------------
  const fetchResumesFromSupabase = async (userId: string, userEmail?: string) => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data, error } = await (client.from('resumes') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Map backend snake_case to frontend camelCase
        const mappedList = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          location: item.location,
          linkedin: item.linkedin,
          github: item.github,
          role: item.role,
          skills: item.skills,
          experience: item.experience,
          education: item.education,
          certifications: item.certifications,
          languages: item.languages,
          awards: item.awards,
          accentColor: item.accent_color,
          resumeTheme: item.resume_theme,
          customRoleName: item.custom_role_name,
          customRoleSkills: item.custom_role_skills,
          savedAt: new Date(item.updated_at).toLocaleString()
        }));
        setSavedResumesList(mappedList);

        // Automatically populate workspace form fields with the user's latest database CV draft on login
        if (mappedList.length > 0) {
          const latest = mappedList[0];
          setName(latest.name || '');
          setEmail(latest.email || '');
          setPhone(latest.phone || '');
          setLocation(latest.location || '');
          setLinkedin(latest.linkedin || '');
          setGithub(latest.github || '');
          setRole(latest.role || 'frontend');
          setSkills(latest.skills || '');
          setExperience(latest.experience || '');
          const edu = latest.education || '';
          setEducation(edu);
          setEducationList(parseEducationString(edu));
          setCertifications(latest.certifications || '');
          setLanguages(latest.languages || '');
          setAwards(latest.awards || '');
          if (latest.accentColor) setAccentColor(latest.accentColor);
          if (latest.resumeTheme) setResumeTheme(latest.resumeTheme);
          if (latest.customRoleName) setCustomRoleName(latest.customRoleName);
          if (latest.customRoleSkills) setCustomRoleSkills(latest.customRoleSkills);
          triggerNotification("Synced & loaded your latest CV draft from Supabase!", "success");
        } else {
          // No resumes found, clear form and pre-fill email
          clearResumeForm(userEmail || currentUserEmail || '');
        }
      }
    } catch (e: any) {
      console.error("Failed to fetch resumes from Supabase:", e);
      triggerNotification("Unable to load resumes from live database", "error");
    }
  };



  // -------------------------------------------------------------
  // LOGIN / SIGN UP / LOGOUT CONTROLS
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!usernameInput.trim()) {
      setAuthError('Please enter an email address');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setAuthError('Supabase project configuration is missing or disconnected');
      return;
    }

    if (!passwordInput.trim()) {
      setAuthError('Password is required');
      return;
    }

    setIsConnectingDb(true);
    try {
      if (isAuthSignUp) {
        // 1. SIGN UP - Check if email already registered in our custom 'profiles' table
        const { data: existingUser, error: checkError } = await (client
          .from('profiles') as any)
          .select('*')
          .eq('email', usernameInput.trim().toLowerCase())
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          setAuthError('This email is already registered!');
          triggerNotification("Email is already registered!", "error");
          return;
        }

        // 2. Insert user directly to our custom 'profiles' table
        const { data: newUser, error: insertError } = await (client
          .from('profiles') as any)
          .insert([{ 
            email: usernameInput.trim().toLowerCase(), 
            password: passwordInput 
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newUser) {
          triggerNotification("Account created successfully!", "success");
          localStorage.setItem("skillsync_user_id", newUser.id);
          localStorage.setItem("skillsync_user_email", newUser.email);
          setCurrentUserId(newUser.id);
          setCurrentUserEmail(newUser.email);
          setIsLoggedIn(true);
          setShowWelcomeCard(true);
          setTimeout(() => setShowWelcomeCard(false), 2600);
          
          // Clear any draft from previous session and reset form with new email
          localStorage.removeItem("skillsync_resume");
          clearResumeForm(newUser.email);

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      } else {
        // SIGN IN - Check email and password in our custom 'profiles' table
        const { data: user, error: loginError } = await (client
          .from('profiles') as any)
          .select('*')
          .eq('email', usernameInput.trim().toLowerCase())
          .eq('password', passwordInput)
          .maybeSingle();

        if (loginError) throw loginError;

        if (!user) {
          setAuthError('Invalid email or password');
          triggerNotification("Invalid email or password", "error");
          return;
        }

        triggerNotification("Authenticated successfully with Database!", "success");
        localStorage.setItem("skillsync_user_id", user.id);
        localStorage.setItem("skillsync_user_email", user.email);
        setCurrentUserId(user.id);
        setCurrentUserEmail(user.email);
        setIsLoggedIn(true);
        setShowWelcomeCard(true);
        setTimeout(() => setShowWelcomeCard(false), 2600);

        // Fetch user's CV drafts
        fetchResumesFromSupabase(user.id, user.email);

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError(error.message || 'Authentication failed');
      triggerNotification("Authentication failed", "error");
    } finally {
      setIsConnectingDb(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("skillsync_user_id");
    localStorage.removeItem("skillsync_user_email");
    localStorage.removeItem("skillsync_resume");
    setCurrentUserId('');
    setCurrentUserEmail('');
    setIsLoggedIn(false);
    setSavedResumesList([]);
    setUsernameInput('');
    setPasswordInput('');
    clearResumeForm();
    triggerNotification('Logged out successfully.', 'info');
  };

  // -------------------------------------------------------------
  // GEMINI AI INTEGRATION HANDLERS
  // -------------------------------------------------------------
  const callGeminiAPI = async (promptText: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('skillsync_gemini_key') || '';
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env or input it in the console.");
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Received empty response from Gemini API.");
    }
    return resultText;
  };

  const handleComposeLetter = async () => {
    setIsGeneratingLetter(true);
    setCoverLetter('');
    try {
      const roleTitle = role === 'custom' ? customRoleName : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`;
      const promptText = `You are an expert executive resume writer and career coach.
Compose a professional, highly-polished cover letter based on the following candidate profile:
Name: ${name || 'Candidate'}
Target Role: ${roleTitle}
Skills: ${skills || 'Not specified'}
Experience: ${experience || 'Not specified'}

Write a complete, ready-to-use cover letter. Keep it engaging, professional, and tailored. Address it to "Hiring Team". Do not include placeholder brackets, tags, or variables in the final letter.`;
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('skillsync_gemini_key') || '';
      if (!apiKey) {
        // Fallback local simulation
        setTimeout(() => {
          setIsGeneratingLetter(false);
          setCoverLetter(`Dear Hiring Team,

I am writing to express my enthusiastic interest in the ${roleTitle} position. With a strong background in structuring resilient solutions and a robust skillset including ${skills || 'relevant development technologies'}, I am confident in my ability to deliver immediate value to your organization.

Throughout my career, as outlined in my SkillSync portfolio, I have focused on optimizing performance metrics and streamlining code maintainability. For example, my experience includes:
${experience ? experience.split('\n').map(l => `- ${l}`).slice(0, 2).join('\n') : '- Engineering scalable frontend interfaces and modular applications.\n- Integrating high-performance database sync mechanics.'}

I look forward to discussing how my experience and technical skills align with your organization's goals.

Sincerely,
${name || 'Alex Mercer'}`);
          triggerNotification("Generated (Local Emulation Mode)", "info");
        }, 1200);
        return;
      }

      const output = await callGeminiAPI(promptText);
      setCoverLetter(output);
      triggerNotification("AI Cover Letter Composed via Gemini!", "success");
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.8 }
      });
    } catch (err: any) {
      triggerNotification(err?.message || "Failed to generate cover letter", "error");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleSubmitInterviewAnswer = async () => {
    if (!interviewAnswer.trim()) {
      triggerNotification("Please type an answer first!", "error");
      return;
    }
    setIsAnalyzingAnswer(true);
    setInterviewFeedback('');
    try {
      const roleTitle = role === 'custom' ? customRoleName : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`;
      const questions = role === 'frontend'
        ? [
            "How do you optimize page loading performance and asset rendering speed in React 19?",
            "What is the difference between client-side rendering (CSR) and server-side rendering (SSR), and when would you use each?",
            "How does TypeScript's strict typing system improve structural safety in complex frontend codebases?"
          ]
        : role === 'backend'
        ? [
            "How do you design a database schema for high-throughput, concurrent write operations?",
            "Explain key mechanisms to prevent race conditions and ensure transactional safety in Express/PostgreSQL.",
            "What are the trade-offs of microservices architectures vs monolithic architectures in backend scaling?"
          ]
        : [
            "What are the typical stages of data cleaning and formatting before applying machine learning regressions?",
            "How do you translate heavy raw SQL records into visual dashboard KPIs for executive stakeholders?",
            "What is the statistical significance of p-value, and how does it affect business demographic analysis?"
          ];
      const questionText = questions[selectedQuestionIndex];
      
      const promptText = `You are a strict technical recruiter evaluating a candidate for the role: ${roleTitle}.
The candidate was asked the following question: "${questionText}"
They provided the following answer: "${interviewAnswer}"

Analyze their answer. Keep your response brief, professional, and structured:
1. Provide a rating: [EXCELLENT RESPONSE], [CONCEPTUALLY CORRECT], or [ACTION REQUIRED].
2. Highlight what was good.
3. Suggest 1-2 points of improvement or missing technical terms.
Keep the total output under 4 lines of text.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('skillsync_gemini_key') || '';
      if (!apiKey) {
        // Fallback local simulation
        setTimeout(() => {
          setIsAnalyzingAnswer(false);
          const text = interviewAnswer.toLowerCase();
          let rating = "Good Try!";
          let msg = "";
          
          if (text.length > 30 && (text.includes("performance") || text.includes("cache") || text.includes("scale") || text.includes("index") || text.includes("type") || text.includes("data") || text.includes("sql") || text.includes("clean") || text.includes("optimization") || text.includes("load") || text.includes("render"))) {
            rating = "EXCELLENT RESPONSE!";
            msg = "Your answer contains core industry keywords and addresses the technical logic perfectly. Great explanation of structural optimizations!";
            confetti({
              particleCount: 40,
              spread: 30,
              origin: { y: 0.8 }
            });
          } else {
            rating = "CONCEPTUALLY CORRECT";
            msg = "Nice response. Consider expanding with more specific details like indexing query tuning, using memoization techniques, or detailed data pipeline operations.";
          }
          setInterviewFeedback(`[RATING: ${rating}]\n\nFeedback: ${msg}`);
          triggerNotification("Analyzed (Local Emulation Mode)", "info");
        }, 1200);
        return;
      }

      const output = await callGeminiAPI(promptText);
      setInterviewFeedback(output);
      triggerNotification("Answer analyzed via Gemini AI!", "success");
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 }
      });
    } catch (err: any) {
      triggerNotification(err?.message || "Failed to analyze answer", "error");
    } finally {
      setIsAnalyzingAnswer(false);
    }
  };



  // -------------------------------------------------------------
  // ATS REAL-TIME COMPUTATIONS
  // -------------------------------------------------------------
  const normalize = (s: string) => s.toLowerCase().trim();

  // Parse current user skills
  const userSkillsArray = skills
    .split(",")
    .map(s => normalize(s))
    .filter(s => s.length > 0);

  // Required skills for active role
  const requiredSkills = role === 'custom'
    ? customRoleSkills.split(",").map(s => normalize(s)).filter(s => s.length > 0)
    : (ROLE_SKILLS[role] || []);

  // Compute matched and missing
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach(reqSkill => {
    const hasSkill = userSkillsArray.some(userSkill =>
      userSkill === reqSkill || userSkill.includes(reqSkill) || reqSkill.includes(userSkill)
    );
    if (hasSkill) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const atsScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  // -------------------------------------------------------------
  // RESUME OPERATIONS
  // -------------------------------------------------------------
  const handleAddSkillPill = () => {
    if (!newSkillInput.trim()) return;
    const cleanNewSkill = newSkillInput.trim();

    if (skills.trim()) {
      const parts = skills.split(',').map(s => s.trim().toLowerCase());
      if (parts.includes(cleanNewSkill.toLowerCase())) {
        triggerNotification(`Skill "${cleanNewSkill}" is already in your list!`, 'info');
        setNewSkillInput('');
        return;
      }
      setSkills(prev => prev.trim().endsWith(',') ? `${prev} ${cleanNewSkill}` : `${prev}, ${cleanNewSkill}`);
    } else {
      setSkills(cleanNewSkill);
    }

    setNewSkillInput('');
    triggerNotification(`Added skill: ${cleanNewSkill}`, 'success');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.toLowerCase() !== skillToRemove.toLowerCase())
      .join(', ');
    setSkills(updated);
  };

  const applyMissingSkills = () => {
    if (missingSkills.length === 0) {
      triggerNotification("You already have all required skills for this role!", "info");
      return;
    }

    const currentSkillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
    const updatedSkills = [...currentSkillsList, ...missingSkills].join(', ');

    setSkills(updatedSkills);
    triggerNotification("All missing skills auto-injected!", "success");

    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#8b5cf6', '#10b981', '#3b82f6'],
      origin: { y: 0.8 }
    });
  };

  const enhanceResume = async () => {
    setIsScanning(true);
    triggerNotification("AI Copywriting engine scanning & rewriting experience...", "info");

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('skillsync_gemini_key') || '';
    if (!apiKey) {
      // Fallback local simulation
      setTimeout(() => {
        const content = role === 'custom'
          ? {
              summary: `Highly passionate ${customRoleName} specialized in developing modern solutions. Proven track record of leveraging industry best practices and emerging architectures to design and execute resilient, optimized features.`,
              experience: `Lead ${customRoleName} • Cyberdyne Labs (2023 - Present)\n- Orchestrated modern technical frameworks, improving overall delivery workflows by 35%.\n- Authored dynamic solutions, streamlining data structures and code reliability.\n- Collaborated with engineering teams to deploy responsive interfaces and safe server APIs.`
            }
          : (ROLE_CONTENT[role] || ROLE_CONTENT.frontend);

        setExperience(content.experience);
        triggerNotification("Resume enhanced (Local Emulation Mode)", "info");
        setIsScanning(false);
        confetti({
          particleCount: 60,
          spread: 40,
          origin: { x: 0.8, y: 0.4 }
        });
      }, 1200);
      return;
    }

    try {
      const roleTitle = role === 'custom' ? customRoleName : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`;
      const promptText = experience.trim()
        ? `You are an expert executive resume copywriter and recruiter.
Rewrite the following raw job experience description to make it highly professional, action-oriented, and ATS-optimized for the target role "${roleTitle}" with skills "${skills}".
Use strong bullet points with dynamic action verbs. Keep the content length and structure similar to the original, but significantly elevate the professional tone.

Candidate's Current Experience description:
"${experience}"

Provide ONLY the rewritten experience description, with no introductory or concluding chat remarks.`
        : `You are an expert executive resume copywriter and recruiter.
Generate a premium, professional sample work experience section for a candidate targeting the role "${roleTitle}" with skills "${skills}".
Use bullet points with strong action verbs. Format it with a mock company and date (e.g. "Senior ${roleTitle} • Enterprise Labs (2023 - Present)\n- ...").

Provide ONLY the generated sample experience, with no introductory or concluding chat remarks.`;

      const output = await callGeminiAPI(promptText);
      setExperience(output);
      triggerNotification("Resume enhanced with live Gemini AI!", "success");
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.8, y: 0.4 }
      });
    } catch (err: any) {
      triggerNotification(err?.message || "AI Enhancement failed", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const syncThemeToCache = (newTheme: 'classic' | 'modern' | 'minimalist' | 'blackontop' | 'worldtop', newAccent?: string) => {
    const activeAccent = newAccent || accentColor;
    const resumeData = {
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      role,
      skills,
      experience,
      education,
      certifications,
      languages,
      awards,
      accentColor: activeAccent,
      resumeTheme: newTheme,
      customRoleName,
      customRoleSkills
    };
    localStorage.setItem("skillsync_resume", JSON.stringify({
      id: Date.now().toString(),
      ...resumeData,
      savedAt: new Date().toLocaleString()
    }));
  };

  const fetchJobDemandData = async (query: string) => {
    if (!query.trim()) {
      triggerNotification("Please enter a valid job title to search.", "error");
      return;
    }
    
    setIsFetchingDemand(true);
    triggerNotification(`Analyzing job demand trends for "${query}"...`, "info");
    
    try {
      const prompt = `You are a real-time global job market analyst. Generate a detailed, highly accurate, structured JSON report detailing the real-time global demand, trends, and Google search/hiring telemetry for the role: "${query}".

The JSON response MUST match this exact schema:
{
  "role": "${query}",
  "globalDemandScore": 87,
  "growthForecast": "+18.4% (Next 12 Months)",
  "averageSalaryUSD": {
    "entry": 75000,
    "mid": 115000,
    "senior": 160000
  },
  "topRegions": [
    { "name": "North America", "demandLevel": "Critical", "hotspots": ["San Francisco", "New York", "Austin"] },
    { "name": "Europe", "demandLevel": "High", "hotspots": ["London", "Berlin", "Amsterdam"] },
    { "name": "Asia Pacific", "demandLevel": "Rising", "hotspots": ["Singapore", "Bangalore", "Tokyo"] }
  ],
  "marketTrendSummary": "An executive analysis of current search interest and market hiring trends.",
  "demandedSkills": [
    { "skill": "React.js", "frequencyPercent": 92, "category": "Frontend" },
    { "skill": "TypeScript", "frequencyPercent": 84, "category": "Language" }
  ],
  "googleSearchInterestTrend": [
    { "month": "Jan", "interest": 75 },
    { "month": "Feb", "interest": 78 },
    { "month": "Mar", "interest": 85 },
    { "month": "Apr", "interest": 82 },
    { "month": "May", "interest": 91 }
  ],
  "recentOpenPositionsKeywords": [
    "Senior Full Stack Engineer at Fintech Labs",
    "Solutions Architect at Cloud Systems",
    "Lead Developer at AI Solutions"
  ]
}

Provide ONLY the valid raw JSON string. Do not wrap it in markdown code blocks like \`\`\`json or add any other text.`;

      const responseText = await callGeminiAPI(prompt);
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      
      const parsed = JSON.parse(cleanedText);
      setDemandData(parsed);
      triggerNotification(`Hiring intelligence compiled for "${query}"!`, "success");
      
      confetti({
        particleCount: 60,
        spread: 45,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      console.error(err);
      const fallbackData = {
        role: query,
        globalDemandScore: 92,
        growthForecast: "+24.5% (High Expansion)",
        averageSalaryUSD: {
          entry: 82000,
          mid: 125000,
          senior: 175000
        },
        topRegions: [
          { name: "North America", demandLevel: "Critical", hotspots: ["San Francisco", "New York", "Seattle"] },
          { name: "Europe", demandLevel: "High", hotspots: ["London", "Dublin", "Munich"] },
          { name: "Asia Pacific", demandLevel: "Extreme", hotspots: ["Sydney", "Singapore", "Tokyo"] }
        ],
        marketTrendSummary: "Displaying cached global demand database for development reference. Market shows critical shortage of skilled architects.",
        demandedSkills: [
          { skill: "Next.js / React", frequencyPercent: 96, category: "Framework" },
          { skill: "TypeScript", frequencyPercent: 88, category: "Language" },
          { skill: "Node.js / Go", frequencyPercent: 82, category: "Backend" },
          { skill: "Cloud Architecture", frequencyPercent: 78, category: "Infrastructure" }
        ],
        googleSearchInterestTrend: [
          { month: "Jan", interest: 82 },
          { month: "Feb", interest: 88 },
          { month: "Mar", interest: 91 },
          { month: "Apr", interest: 95 },
          { month: "May", interest: 98 }
        ],
        recentOpenPositionsKeywords: [
          "Senior Developer • Cloud Platforms Inc.",
          "Lead Architect • AI Dynamics Group",
          "Staff Engineer • Global Finance Systems",
          "Devops Architect • Enterprise Scale"
        ]
      };
      setDemandData(fallbackData);
      triggerNotification("Displaying sandbox job trends database.", "info");
    } finally {
      setIsFetchingDemand(false);
    }
  };

  const generateCareerPathway = async (start: string, end: string) => {
    if (!start.trim() || !end.trim()) {
      triggerNotification("Please enter both starting and target positions.", "error");
      return;
    }
    
    setIsGeneratingPathway(true);
    triggerNotification(`Architecting career pathway from ${start} to ${end}...`, "info");
    
    try {
      const prompt = `You are an executive career coach and organizational architect. Create a structured, premium JSON career roadmap mapping the journey from "${start}" to "${end}".

The JSON response MUST match this exact schema:
{
  "startRole": "${start}",
  "targetRole": "${end}",
  "totalEstYears": "8-10 Years",
  "milestones": [
    {
      "id": "m1",
      "title": "Senior Engineer",
      "timeline": "Year 1-3",
      "avgSalaryUSD": 135000,
      "growthTip": "Focus on high-scale distributed systems and mentoring junior staff.",
      "skillsToAcquire": [
        { "id": "s1", "name": "System Design & Scalability" },
        { "id": "s2", "name": "Cross-team Technical Leadership" }
      ]
    },
    {
      "id": "m2",
      "title": "Staff Architect",
      "timeline": "Year 4-6",
      "avgSalaryUSD": 180000,
      "growthTip": "Lead technical roadmap definition and align architectures with business goals.",
      "skillsToAcquire": [
        { "id": "s3", "name": "Strategic Technology Planning" },
        { "id": "s4", "name": "Stakeholder Management" }
      ]
    },
    {
      "id": "m3",
      "title": "${end}",
      "timeline": "Year 7+",
      "avgSalaryUSD": 240000,
      "growthTip": "Steer organization-wide technical strategy and manage tech budget allocation.",
      "skillsToAcquire": [
        { "id": "s5", "name": "Executive Communication" },
        { "id": "s6", "name": "Organizational Leadership" }
      ]
    }
  ]
}

Provide ONLY the valid raw JSON string. Do not wrap it in markdown code blocks like \`\`\`json or add any other text.`;

      const responseText = await callGeminiAPI(prompt);
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      
      const parsed = JSON.parse(cleanedText);
      setPathwayData(parsed);
      setCompletedCheckpoints([]);
      triggerNotification("Career pathway designed successfully!", "success");
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      const fallbackPathway = {
        startRole: start,
        targetRole: end,
        totalEstYears: "7-9 Years",
        milestones: [
          {
            id: "m1",
            title: `Advanced ${start}`,
            timeline: "Year 1-2",
            avgSalaryUSD: 110000,
            growthTip: "Deepen core technological mastery and lead modular feature implementations.",
            skillsToAcquire: [
              { id: "s1", name: "System Scalability & Performance Tuning" },
              { id: "s2", name: "Peer Mentorship & Code Standards" }
            ]
          },
          {
            id: "m2",
            title: "Technical Lead",
            timeline: "Year 3-5",
            avgSalaryUSD: 145000,
            growthTip: "Take ownership of system delivery lifecycles and translate product specs into architectures.",
            skillsToAcquire: [
              { id: "s3", name: "Microservice Design & Cloud Pipelines" },
              { id: "s4", name: "Agile Project Planning & Delivery" }
            ]
          },
          {
            id: "m3",
            title: end,
            timeline: "Year 6+",
            avgSalaryUSD: 195000,
            growthTip: "Establish technical governance, drive long-term roadmaps, and influence business objectives.",
            skillsToAcquire: [
              { id: "s5", name: "Executive Leadership & Tech Strategy" },
              { id: "s6", name: "Budget Alignment & Org Design" }
            ]
          }
        ]
      };
      setPathwayData(fallbackPathway);
      setCompletedCheckpoints([]);
      triggerNotification("Displaying sandbox pathway blueprint database.", "info");
    } finally {
      setIsGeneratingPathway(false);
    }
  };

  const toggleCheckpoint = (skillId: string) => {
    setCompletedCheckpoints(prev => {
      const next = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
        
      if (!prev.includes(skillId)) {
        confetti({
          particleCount: 20,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.8 }
        });
      }
      return next;
    });
  };

  const saveResumeDraft = async () => {
    const client = getSupabaseClient();
    if (!client) {
      triggerNotification("Database connection missing or offline.", "error");
      return;
    }

    const resumeData = {
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      skills,
      experience,
      education,
      certifications,
      languages,
      awards,
      role,
      accentColor,
      resumeTheme,
      customRoleName,
      customRoleSkills,
    };

    // Check if we are updating an existing resume with matching name and role
    const matchingResume = savedResumesList.find(r => r.name.toLowerCase() === name.toLowerCase() && r.role === role);

    // 2. Supabase Live Database Syncing
    try {
      if (!currentUserId) {
        triggerNotification("Session expired. Please log in again to write drafts.", "error");
        return;
      }

      const payload = {
        user_id: currentUserId,
        name,
        email,
        phone,
        location,
        linkedin,
        github,
        role,
        skills,
        experience,
        education,
        certifications,
        languages,
        awards,
        accent_color: accentColor,
        resume_theme: resumeTheme,
        custom_role_name: customRoleName,
        custom_role_skills: customRoleSkills,
      };

      if (matchingResume) {
        const { error } = await (client.from('resumes') as any)
          .update(payload)
          .eq('id', matchingResume.id);

        if (error) throw error;
        triggerNotification("Resume draft updated successfully in your Supabase DB!", "success");
      } else {
        const { error } = await (client.from('resumes') as any)
          .insert([payload]);

        if (error) throw error;
        triggerNotification("New resume draft saved successfully to your Supabase DB!", "success");
      }

      // Re-fetch database lists
      fetchResumesFromSupabase(currentUserId);

      // Save a local copy for cache reference
      localStorage.setItem("skillsync_resume", JSON.stringify({
        id: matchingResume?.id || Date.now().toString(),
        ...resumeData,
        savedAt: new Date().toLocaleString()
      }));

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e: any) {
      console.error("Failed to save draft to Supabase:", e);
      
      const isMissingColumn = e.message?.toLowerCase().includes("column") || e.message?.toLowerCase().includes("does not exist");
      if (isMissingColumn) {
        // Fallback: save to LocalStorage so they don't lose any data!
        localStorage.setItem("skillsync_resume", JSON.stringify({
          id: matchingResume?.id || Date.now().toString(),
          ...resumeData,
          savedAt: new Date().toLocaleString()
        }));
        triggerNotification("Database columns missing! Draft saved LOCALLY. See instructions to run the SQL patch.", "error");
        console.warn("SQL PATCH REQUIRED: Please run this in your Supabase SQL Editor:\nALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS phone text, ADD COLUMN IF NOT EXISTS location text, ADD COLUMN IF NOT EXISTS linkedin text, ADD COLUMN IF NOT EXISTS github text, ADD COLUMN IF NOT EXISTS certifications text, ADD COLUMN IF NOT EXISTS languages text, ADD COLUMN IF NOT EXISTS awards text, ADD COLUMN IF NOT EXISTS accent_color text, ADD COLUMN IF NOT EXISTS resume_theme text, ADD COLUMN IF NOT EXISTS custom_role_name text, ADD COLUMN IF NOT EXISTS custom_role_skills text;");
      } else {
        triggerNotification(`Database Error: ${e.message || 'Failed to write'}`, "error");
      }
    }
  };

  const loadSavedResume = (savedData: any) => {
    setName(savedData.name || '');
    setEmail(savedData.email || '');
    setPhone(savedData.phone || '');
    setLocation(savedData.location || '');
    setLinkedin(savedData.linkedin || '');
    setGithub(savedData.github || '');
    setRole(savedData.role || 'frontend');
    setSkills(savedData.skills || '');
    setExperience(savedData.experience || '');
    const edu = savedData.education || '';
    setEducation(edu);
    setEducationList(parseEducationString(edu));
    setCertifications(savedData.certifications || '');
    setLanguages(savedData.languages || '');
    setAwards(savedData.awards || '');
    if (savedData.accentColor) setAccentColor(savedData.accentColor);
    if (savedData.resumeTheme) setResumeTheme(savedData.resumeTheme);
    if (savedData.customRoleName) setCustomRoleName(savedData.customRoleName);
    if (savedData.customRoleSkills) setCustomRoleSkills(savedData.customRoleSkills);

    setShowSavedListModal(false);
    triggerNotification(`Loaded resume for "${savedData.name}"!`, "success");
  };

  const deleteSavedResume = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const client = getSupabaseClient();
    if (!client) {
      triggerNotification("Database connection missing or offline.", "error");
      return;
    }

    // 2. Supabase live deletion
    try {
      const { error } = await (client.from('resumes') as any)
        .delete()
        .eq('id', idToDelete);

      if (error) throw error;

      triggerNotification("Resume draft successfully deleted from Supabase!", "success");
      setSavedResumesList(prev => prev.filter(item => item.id !== idToDelete));
    } catch (e: any) {
      console.error("Failed to delete draft:", e);
      triggerNotification("Failed to delete draft from database", "error");
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC SCRIPT LOAD FOR PDF EXPORT
  // -------------------------------------------------------------
  const exportPDF = async () => {
    if (!resumeRef.current) {
      triggerNotification("Resume preview node not loaded!", "error");
      return;
    }

    triggerNotification("Preparing premium PDF export...", "info");

    try {
      let html2pdf = window.html2pdf;
      if (!html2pdf) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
        script.async = true;

        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => resolve(window.html2pdf);
          script.onerror = () => reject(new Error("Failed to load PDF library"));
        });

        document.body.appendChild(script);
        html2pdf = await loadPromise;
      }

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `SkillSync_${name.trim().replace(/\s+/g, '_') || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(resumeRef.current).set(opt).save();
      triggerNotification("PDF generated successfully!", "success");

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (error) {
      console.error("PDF export error", error);
      triggerNotification("Could not compile PDF. Try using native Print (Cmd+P).", "error");
    }
  };

  // -------------------------------------------------------------
  // RENDER THEMES
  // -------------------------------------------------------------
  const currentAccent = SHOWN_ACCENT_COLORS.find(c => c.id === accentColor) || SHOWN_ACCENT_COLORS[0];

  const accentText = { color: currentAccent.hex };
  const accentBg = { backgroundColor: currentAccent.hex };
  const accentBorder = { borderColor: currentAccent.hex };

  const getSummaryContent = () => {
    const defaults: Record<string, string> = {
      frontend: "Vibrant and detail-oriented Frontend Developer with custom expertise in building responsive, accessible, and high-performing web interfaces. Proficient in React, TypeScript, and modern styling solutions.",
      backend: "Architecturally-focused Backend Developer with deep foundations in server-side logic, microservices, and database query tuning. Skilled in developing RESTful APIs.",
      data: "Insight-driven Data Analyst expert in translating complex database collections into visual business intelligence dashboards."
    };

    if (role === 'custom') {
      return `Motivated software practitioner targeting a professional ${customRoleName} role. Expert in structuring and integrating modern frameworks and implementing required technological tools.`;
    }
    return ROLE_CONTENT[role]?.summary || defaults.frontend;
  };

  const isSupabaseConfigured = true;

  // Render animated Welcome Card immediately after successful authentication
  if (showWelcomeCard) {
    return (
      <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden font-sans">
        
        {/* Style block for loading bar keyframes */}
        <style>{`
          @keyframes loadingBar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>

        {/* Ambient premium cinematic backdrop glow */}
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse" />

        <div className="relative z-10 w-full max-w-md backdrop-blur-3xl bg-slate-900/60 border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl shadow-violet-950/20 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
          
          {/* Animated bounce badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6 ring-4 ring-violet-500/15 animate-bounce">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>

          <span className="text-xs text-violet-400 font-extrabold uppercase tracking-widest mb-2">
            Workspace Initialized
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome to SkillSync!
          </h2>

          <p className="text-slate-400 text-xs max-w-xs mb-8">
            Authenticated successfully as <span className="text-violet-300 font-semibold">{currentUserEmail}</span>
          </p>

          {/* Premium animated Loading track */}
          <div className="w-full bg-slate-950/60 rounded-full h-1.5 border border-white/[0.04] p-0.5 overflow-hidden mb-5">
            <div 
              className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full" 
              style={{ 
                animation: 'loadingBar 2.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
              }} 
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-extrabold tracking-widest animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span>Syncing Cloud Database Workspace...</span>
          </div>

        </div>
      </div>
    );
  }

  // Render Login view if user isn't authenticated
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-[#090b11] text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden font-sans">

        {/* Static database connected indicator in corner */}
        <div className="absolute top-4 right-4 z-40">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 backdrop-blur-md select-none"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Background Mesh Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse" />

        <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-slate-900/60 border border-white/[0.08] rounded-3xl p-6 md:p-10 shadow-2xl shadow-violet-950/20">

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 ring-4 ring-violet-500/15">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              SkillSync
            </h1>
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mt-1">
              Resume Builder & ATS Optimizer
            </p>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-xs">
              {isSupabaseConfigured
                ? "Connecting to live Supabase Backend. Enter your credentials or sign up below to sync your database."
                : "Create beautiful resumes, analyze required skills, and instant-match your profile for corporate recruiters."
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">



            {isSupabaseConfigured && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/[0.04] mb-2">
                <button
                  type="button"
                  onClick={() => setIsAuthSignUp(false)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${!isAuthSignUp
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthSignUp(true)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${isAuthSignUp
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-left leading-relaxed">{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isSupabaseConfigured ? 'Email Address' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={isSupabaseConfigured ? "email" : "text"}
                  placeholder={isSupabaseConfigured ? "you@example.com" : "Enter username"}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                  disabled={!isSupabaseConfigured}
                />
                {!isSupabaseConfigured && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">not needed in sandbox</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isConnectingDb}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-700/20 text-white flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {isConnectingDb ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Connecting to Database...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isAuthSignUp ? 'Create Supabase Account' : 'Sign In to Supabase'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-600 text-center uppercase tracking-widest">
          SkillSync © Final Year Project • Made with React & Vite
        </div>
      </div>
    );
  }



  // -------------------------------------------------------------
  // DYNAMIC RADAR CHART CALCULATIONS
  // -------------------------------------------------------------
  const activeSkillsList = ROLE_SKILLS[role] || [];
  const matchedSkillsCount = activeSkillsList.filter(s => skills.toLowerCase().includes(s.toLowerCase())).length;
  
  const profVal = activeSkillsList.length > 0 ? Math.round((matchedSkillsCount / activeSkillsList.length) * 100) : 50;
  const keywordVal = atsScore;
  const completeVal = Math.round(
    ((name ? 1 : 0) + 
    (email ? 1 : 0) + 
    (phone ? 1 : 0) + 
    (experience ? 1 : 0) + 
    (education ? 1 : 0)) * 20
  );
  const socialVal = (linkedin ? 50 : 0) + (github ? 50 : 0);
  const structureVal = Math.min(100, Math.round((skills.split(',').filter(Boolean).length * 8) + (experience.length > 100 ? 50 : 20)));

  const center = 100;
  const radius = 70;
  const maxVal = 100;
  
  const radarValues = [
    profVal, 
    keywordVal, 
    completeVal, 
    socialVal, 
    structureVal
  ];
  
  const angles = [
    -Math.PI / 2, // Top (Proficiency)
    -Math.PI / 2 + (2 * Math.PI) / 5, // Right Top (Keywords)
    -Math.PI / 2 + (4 * Math.PI) / 5, // Right Bottom (Completeness)
    -Math.PI / 2 + (6 * Math.PI) / 5, // Left Bottom (Social)
    -Math.PI / 2 + (8 * Math.PI) / 5  // Left Top (Structure)
  ];
  
  const radarPoints = radarValues.map((val, i) => {
    const r = (val / maxVal) * radius;
    const cx = center + r * Math.cos(angles[i]);
    const cy = center + r * Math.sin(angles[i]);
    return `${cx},${cy}`;
  }).join(' ');

  const getPentagonPoints = (level: number) => {
    const r = level * radius;
    return angles.map(angle => {
      const cx = center + r * Math.cos(angle);
      const cy = center + r * Math.sin(angle);
      return `${cx},${cy}`;
    }).join(' ');
  };

  // -------------------------------------------------------------
  // DASHBOARD WORKSPACE VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">

      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[50%] h-[30%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[30%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-sm flex items-center gap-3 animate-slide-in backdrop-blur-md ${notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : notification.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
          <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#f43f5e' : '#6366f1' }} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/60 border-b border-white/[0.06] px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 relative overflow-visible">
            {/* Cute Cartoon Mascot Logo playing all the time */}
            <div className="absolute -bottom-0.5 -right-0.5 pointer-events-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
            </div>
            
            <svg width="34" height="34" viewBox="0 0 100 100" className="animate-mascot-float drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {/* Antenna */}
              <rect x="47" y="10" width="6" height="15" fill="#f43f5e" rx="2" />
              <circle cx="50" cy="7" r="5" fill="#10b981" />
              
              {/* Ears/Headphones */}
              <rect x="15" y="32" width="10" height="26" fill="#a78bfa" rx="5" />
              <rect x="75" y="32" width="10" height="26" fill="#a78bfa" rx="5" />
              <path d="M 20 34 A 30 30 0 0 1 80 34" fill="none" stroke="#a78bfa" strokeWidth="4" />
              
              {/* Face screen */}
              <rect x="22" y="24" width="56" height="48" fill="#090d16" stroke="#8b5cf6" strokeWidth="3" rx="14" />
              
              {/* Eyes */}
              <ellipse cx="40" cy="44" rx="5" ry="6" fill="#22d3ee" className="animate-mascot-blink" />
              <ellipse cx="60" cy="44" rx="5" ry="6" fill="#22d3ee" className="animate-mascot-blink" />
              
              {/* Cute blush cheeks */}
              <ellipse cx="34" cy="54" rx="3.5" ry="1.5" fill="#f43f5e" opacity="0.8" />
              <ellipse cx="66" cy="54" rx="3.5" ry="1.5" fill="#f43f5e" opacity="0.8" />
              
              {/* Mouth */}
              <path d="M 44 54 Q 50 59 56 54" fill="none" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Tiny body collar */}
              <path d="M 40 72 L 60 72 L 56 82 L 44 82 Z" fill="#475569" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>SkillSync</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            </h1>
            <p className="text-[9px] text-violet-400 font-semibold tracking-widest uppercase -mt-0.5">Resume Workspace</p>
          </div>
        </div>

        {/* Static Database Connection Badge */}
        <div className="flex items-center gap-2">

          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 select-none"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <button
            onClick={() => setShowSavedListModal(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all flex items-center gap-2 group relative overflow-visible"
          >
            {/* Tiny green robot buddy peeking all the time */}
            <div className="absolute -top-3 -left-2 pointer-events-none drop-shadow-[0_1px_3px_rgba(16,185,129,0.4)]">
              <svg width="18" height="18" viewBox="0 0 100 100" className="animate-mascot-peek-saved overflow-visible">
                <rect x="20" y="20" width="60" height="55" fill="#090d16" stroke="#10b981" strokeWidth="6" rx="15" />
                <rect x="47" y="5" width="6" height="15" fill="#10b981" rx="2" />
                <circle cx="50" cy="4" r="5" fill="#a78bfa" className="animate-pulse" />
                <circle cx="40" cy="45" r="7" fill="#10b981" className="animate-mascot-blink" />
                <circle cx="60" cy="45" r="7" fill="#10b981" className="animate-mascot-blink" />
                <path d="M 45 56 Q 50 60 55 56" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400/80 ml-2" />
            <span>Saved Drafts</span>
            {savedResumesList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center">
                {savedResumesList.length}
              </span>
            )}
          </button>

          <div className="h-6 w-[1px] bg-white/10" />

          {/* User Badge */}
          <div className="items-center gap-2.5 hidden sm:flex bg-slate-900/50 border border-white/[0.04] pl-2.5 pr-3 py-1 rounded-full">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold flex items-center justify-center uppercase">
              {currentUserEmail ? currentUserEmail.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
              {currentUserEmail || 'Guest'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-400 bg-white/[0.01] hover:bg-rose-500/5 border border-white/[0.04] hover:border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer relative overflow-visible"
          >
            {/* Tiny rose/red robot buddy peeking all the time */}
            <div className="absolute -top-3 -right-2 pointer-events-none drop-shadow-[0_1px_3px_rgba(244,63,94,0.4)]">
              <svg width="18" height="18" viewBox="0 0 100 100" className="animate-mascot-peek-logout overflow-visible">
                <rect x="20" y="20" width="60" height="55" fill="#090d16" stroke="#f43f5e" strokeWidth="6" rx="15" />
                <rect x="47" y="5" width="6" height="15" fill="#f43f5e" rx="2" />
                <circle cx="50" cy="4" r="5" fill="#fb7185" className="animate-pulse" />
                <circle cx="40" cy="45" r="7" fill="#fb7185" className="animate-mascot-blink" />
                <circle cx="60" cy="45" r="7" fill="#fb7185" className="animate-mascot-blink" />
                <path d="M 45 56 Q 50 60 55 56" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline mr-2">Logout</span>
          </button>
        </div>
      </header>

      {/* ----------------- SUB NAVBAR TABS ----------------- */}
      <nav className="bg-slate-950/40 border-b border-white/[0.04] px-4 md:px-8 py-2.5 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'builder'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Builder Workspace</span>
          </button>
          
          <button
            onClick={() => setCurrentPage('intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative overflow-visible ${
              currentPage === 'intelligence'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Intelligence Console</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </button>
          
          <button
            onClick={() => setCurrentPage('showroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentPage === 'showroom'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Showroom</span>
          </button>

          <button
            onClick={() => {
              setCurrentPage('demand');
              if (!demandData) {
                const initialRole = role === 'custom' ? (customRoleName || 'Full Stack Developer') : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`;
                setDemandQuery(initialRole);
                fetchJobDemandData(initialRole);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative overflow-visible ${
              currentPage === 'demand'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Job Demands</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentPage('pathway');
              if (!pathwayStart) {
                const initialRole = role === 'custom' ? (customRoleName || 'Full Stack Developer') : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`;
                setPathwayStart(initialRole);
                setPathwayEnd('Chief Technology Officer');
                generateCareerPathway(initialRole, 'Chief Technology Officer');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative overflow-visible ${
              currentPage === 'pathway'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Pathway Architect</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </button>
        </div>
        
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>Active Session ID:</span>
          <span className="text-violet-400">{currentUserId ? currentUserId.substring(0, 8) : 'SANDBOX_GUEST'}</span>
        </div>
      </nav>

      {/* ----------------- PAGE 1: BUILDER WORKSPACE ----------------- */}
      {currentPage === 'builder' && (
        <>
          {/* ----------------- CREATIVE HERO SECTION (DESIGN YOUR LEGACY) ----------------- */}
      <div className="w-full relative overflow-hidden bg-slate-950/80 py-14 flex items-center justify-center border-b border-white/[0.05]">
        {/* Animated background elements */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] backdrop-blur-xl hover:bg-white/[0.04] transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Beyond the Resume</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-400 mb-4 tracking-tight">
            Design Your Legacy.
          </h2>
          
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium mb-6 max-w-lg mx-auto">
            A resume is more than a piece of paper. It's the story of your ambition, your triumphs, and your growth. We build the canvas; <span className="text-violet-300 font-bold">you paint the future.</span>
          </p>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-violet-500/30 to-transparent"></div>
            <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-slate-600 flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-slate-500" />
              Crafted with SkillSync OS
            </p>
          </div>
        </div>
      </div>

      {/* ----------------- CORE DASHBOARD MAIN GRID ----------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ================= LEFT COLUMN: FORM CONTROLS (5 cols) ================= */}
        <section className="lg:col-span-5 flex flex-col gap-5">

          {/* Glass Card Container */}
          <div className="backdrop-blur-xl bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                Resume Parameters
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">real-time sync</span>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/[0.04]">
              {(['profile', 'skills', 'experience', 'extras'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1 CONTENT: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="github.com/username"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Primary Career Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="data">Data Analyst</option>
                      <option value="custom">Custom Target Role...</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                  </div>
                </div>

                {role === 'custom' && (
                  <div className="p-4 rounded-xl bg-violet-600/[0.03] border border-violet-500/15 space-y-3.5 animate-slide-down">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
                        Custom Role Name
                      </label>
                      <input
                        type="text"
                        value={customRoleName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomRoleName(val);
                          if (!val.trim()) {
                            setCustomRoleSkills('');
                          }
                        }}
                        placeholder="e.g. AI Product Manager"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-950/80 border border-violet-500/25 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
                        Required Core Skills (comma-separated)
                      </label>
                      <textarea
                        value={customRoleSkills}
                        onChange={(e) => setCustomRoleSkills(e.target.value)}
                        placeholder="python, api, tensorflow, ml, agile"
                        rows={2}
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-950/80 border border-violet-500/25 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all resize-none font-mono"
                      />
                      <span className="text-[9px] text-slate-500">SkillSync will cross-analyze ATS matching scores against these inputs.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2 CONTENT: SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-4 animate-fade-in">

                {/* Visual Skills Tag List (Modern Pill Input) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Your Skills Pill Registry
                  </label>

                  {/* Skill Pills Container */}
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 min-h-[90px] max-h-[160px] overflow-y-auto">
                    {skills.split(',').map(s => s.trim()).filter(Boolean).length === 0 ? (
                      <span className="text-xs text-slate-600 italic">No skills cataloged yet. Start typing below!</span>
                    ) : (
                      skills.split(',').map((skill, index) => {
                        const trimmed = skill.trim();
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-violet-600/15 border border-violet-500/20 text-violet-300 group hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
                            onClick={() => handleRemoveSkill(trimmed)}
                            title="Click to remove skill"
                          >
                            <span>{trimmed}</span>
                            <span className="text-[9px] text-violet-500 group-hover:text-rose-400 font-bold ml-0.5">×</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Pill Add Form */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillPill())}
                    placeholder="Type new skill (e.g. AWS)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                  />
                  <button
                    onClick={handleAddSkillPill}
                    type="button"
                    className="px-3.5 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 active:scale-95 text-white flex items-center justify-center gap-1 transition-all cursor-pointer text-sm shadow-lg shadow-violet-700/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Standard Area (Raw Text Editor Option) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Skills Raw Comma-Separated Input
                    </label>
                    <span className="text-[9px] text-slate-500">direct sync</span>
                  </div>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="HTML, CSS, JavaScript, React"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3 CONTENT: BACKGROUND */}
            {activeTab === 'experience' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Professional Experience
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="List your job history, bullet points, and main highlights."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all font-sans"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Markdown/Plaintext supported</span>
                    <span>{experience.length} characters</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Education History
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        updateEducationList([...educationList, { degree: '', university: '', year: '' }]);
                      }}
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Institution
                    </button>
                  </div>

                  {educationList.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center bg-slate-950/20">
                      <p className="text-xs text-slate-500">No education history added yet. Click above to add one.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {educationList.map((item, index) => (
                        <div key={index} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3 relative group animate-fade-in">
                          {educationList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = educationList.filter((_, i) => i !== index);
                                updateEducationList(updated);
                              }}
                              className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Degree / Field of Study
                              </label>
                              <input
                                type="text"
                                value={item.degree}
                                onChange={(e) => {
                                  const updated = [...educationList];
                                  updated[index].degree = e.target.value;
                                  updateEducationList(updated);
                                }}
                                placeholder="e.g. B.S. in Computer Science"
                                className="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all font-sans"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                University / School
                              </label>
                              <input
                                type="text"
                                value={item.university}
                                onChange={(e) => {
                                  const updated = [...educationList];
                                  updated[index].university = e.target.value;
                                  updateEducationList(updated);
                                }}
                                placeholder="e.g. Stanford University"
                                className="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Graduation Year / Period
                              </label>
                              <input
                                type="text"
                                value={item.year}
                                onChange={(e) => {
                                  const updated = [...educationList];
                                  updated[index].year = e.target.value;
                                  updateEducationList(updated);
                                }}
                                placeholder="e.g. 2018 - 2022"
                                className="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all font-sans"
                              />
                            </div>
                            {educationList.length === 1 && (
                              <div className="flex items-end justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateEducationList([]);
                                  }}
                                  className="w-full py-2 flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/10 hover:border-rose-500/20 text-rose-400/80 hover:text-rose-400 bg-rose-500/[0.02] text-xs transition-all font-sans"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4 CONTENT: EXTRAS */}
            {activeTab === 'extras' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Certifications & Licenses
                  </label>
                  <textarea
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="AWS Certified Solutions Architect • Professional Scrum Master • Project Management Professional (PMP)"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all font-sans"
                  />
                  <span className="block text-[9px] text-slate-500 mt-1">Separate certifications with bullets (•) or commas</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Languages
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English (Native) • Spanish (Conversational) • German (Basic)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Awards, Honors & Publications
                  </label>
                  <textarea
                    value={awards}
                    onChange={(e) => setAwards(e.target.value)}
                    placeholder="TechCorp Outstanding Achievement (2025) • 1st Place National Hackathon • Published in IEEE Journal"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 transition-all"
                  />
                </div>
              </div>
            )}

          </div>

          {/* DESIGN CUSTOMIZER GLASS CARD */}
          <div className="backdrop-blur-xl bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Palette className="w-4 h-4 text-violet-400" />
              Creative Styling Engine
            </h2>

            {/* Accent selection */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Accent Signature</label>
              <div className="flex flex-wrap gap-2">
                {SHOWN_ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setAccentColor(color.id);
                      triggerNotification(`Accent color updated to ${color.label}!`, 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${accentColor === color.id
                        ? `${color.class} bg-opacity-20`
                        : 'border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${color.id === 'amber' ? 'bg-amber-500' : `bg-${color.id}-500`}`} style={{ backgroundColor: color.hex }} />
                    <span>{color.label}</span>
                    {accentColor === color.id && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Structure Layout</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'modern', label: 'Tech Grid' },
                  { id: 'classic', label: 'Classic Corporate' },
                  { id: 'minimalist', label: 'Minimal Clean' },
                  { id: 'blackontop', label: 'Black on Top' },
                  { id: 'worldtop', label: 'World Top CV' }
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setResumeTheme(t.id);
                      syncThemeToCache(t.id);
                      triggerNotification(`Switched to "${t.label}" layout!`, 'info');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${resumeTheme === t.id
                        ? 'border-violet-500/50 bg-violet-600/10 text-violet-300'
                        : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-300'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: INTERACTIVE LIVE PREVIEW (7 cols) ================= */}
        <section className="lg:col-span-7 flex flex-col gap-5">

          {/* CONTROL STRIP */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-900/30 border border-white/[0.05] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                Interactive Page Canvas
              </span>
            </div>

            {/* Accent quick info */}
            <div className="text-[10px] text-slate-500 bg-[#090b11] px-2.5 py-1 rounded-md border border-white/[0.03]">
              PDF rendering: <span className="font-mono text-slate-300">A4 • 1-Page optimization</span>
            </div>
          </div>

          {/* THE ACTUAL PHYSICAL SHEET OF RESUME PAPER (A4 ASPECT IN CONTAINER) */}
          <div className="w-full overflow-x-auto p-1 bg-slate-950/40 rounded-2xl border border-white/[0.06] shadow-inner relative flex justify-center">

            {/* AI Enhancement Laser Scan effect */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent top-0 animate-[scan_2s_infinite] z-20 pointer-events-none shadow-[0_0_15px_#8b5cf6]" />
            )}

            {/* Resume Sheet Node */}
            <div
              ref={resumeRef}
              id="resume"
              className="w-full max-w-[650px] min-h-[820px] bg-white text-slate-800 p-8 shadow-2xl rounded-sm font-sans flex flex-col gap-6 text-left selection:bg-violet-100 selection:text-slate-900"
              style={{ backgroundColor: '#ffffff' }}
            >

              {/* LAYOUT 1: TECH GRID (MODERN) */}
              {resumeTheme === 'modern' && (
                <div className="flex flex-col gap-5 flex-1">
                  {/* Header band */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5" style={{ borderColor: `${currentAccent.hex}22` }}>
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{name || 'Your Name'}</h1>
                      <p className="text-sm font-bold uppercase tracking-wider mt-1" style={accentText}>
                        {role === 'custom' ? customRoleName : `${role.charAt(0).toUpperCase() + role.slice(1)} Developer`}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                      {email && <p className="font-semibold text-slate-800">{email}</p>}
                      {phone && <p className="font-medium text-slate-700">{phone}</p>}
                      {location && <p>{location}</p>}
                      <div className="flex flex-col items-end gap-0.5 mt-1 text-[10px] text-slate-400">
                        {linkedin && <span>LinkedIn: {linkedin}</span>}
                        {github && <span>GitHub: {github}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Main split grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                    {/* Left Column: Skills & Info (5/12 cols) */}
                    <div className="md:col-span-4 flex flex-col gap-5 border-r pr-4 border-slate-100">
                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">Skills</h3>
                        <div className="flex flex-wrap gap-1">
                          {skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 rounded border text-slate-700"
                              style={{ backgroundColor: '#f8fafc', borderColor: `${currentAccent.hex}20`, borderLeftWidth: '3px', borderLeftColor: currentAccent.hex }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b pb-1">Education</h3>
                        <div className="text-xs space-y-1 text-slate-600 font-medium">
                          {education ? (
                            education.split('\n').map((line, i) => <p key={i} className="leading-relaxed">{line}</p>)
                          ) : (
                            <p className="italic text-slate-400">Education not entered yet</p>
                          )}
                        </div>
                      </div>

                      {certifications && (
                        <div className="mt-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b pb-1">Certifications</h3>
                          <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
                            {certifications.split('•').map((cert, i) => <p key={i}>{cert.trim()}</p>)}
                          </div>
                        </div>
                      )}

                      {languages && (
                        <div className="mt-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b pb-1">Languages</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{languages}</p>
                        </div>
                      )}

                      {awards && (
                        <div className="mt-1">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2 border-b pb-1">Honors & Awards</h3>
                          <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
                            {awards.split('•').map((award, i) => <p key={i}>{award.trim()}</p>)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Experience & Professional summary (8/12 cols) */}
                    <div className="md:col-span-8 flex flex-col gap-5">
                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={accentBg} />
                          Professional Summary
                        </h3>
                        <p className="text-[12px] text-slate-700 leading-relaxed text-justify">
                          {getSummaryContent()}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={accentBg} />
                          Professional Experience
                        </h3>
                        <div className="text-xs space-y-4 text-slate-700">
                          {experience ? (
                            experience.split('\n').map((line, i) => {
                              if (line.startsWith('-')) {
                                return (
                                  <li key={i} className="list-none pl-4 relative text-[11px] leading-relaxed text-slate-600 mt-1">
                                    <span className="absolute left-1 top-[6px] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${currentAccent.hex}88` }} />
                                    {line.replace(/^-/, '').trim()}
                                  </li>
                                );
                              }
                              return <p key={i} className="font-semibold text-slate-800 mt-2">{line}</p>;
                            })
                          ) : (
                            <p className="italic text-slate-400">Enter experience in the left controls</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LAYOUT 2: CLASSIC CORPORATE */}
              {resumeTheme === 'classic' && (
                <div className="flex flex-col gap-5 flex-1">
                  {/* Top Centered Header */}
                  <div className="text-center pb-4 border-b-2" style={{ borderColor: currentAccent.hex }}>
                    <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wide">{name || 'Your Name'}</h1>
                    <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-2 font-medium">
                      {email && <span>{email}</span>}
                      {phone && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{phone}</span>
                        </>
                      )}
                      {location && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{location}</span>
                        </>
                      )}
                      {linkedin && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>LinkedIn: {linkedin}</span>
                        </>
                      )}
                      {github && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>GitHub: {github}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-extrabold uppercase tracking-widest mt-2" style={accentText}>
                      {role === 'custom' ? customRoleName : `${role.toUpperCase()} ENGINEER`}
                    </p>
                  </div>

                  {/* Summary */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 text-slate-700 mb-2 border-l-4" style={{ ...accentBorder, backgroundColor: '#f1f5f9' }}>
                      Executive Statement
                    </h3>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed text-justify italic">
                      "{getSummaryContent()}"
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 text-slate-700 mb-2 border-l-4" style={{ ...accentBorder, backgroundColor: '#f1f5f9' }}>
                      Professional Timeline
                    </h3>
                    <div className="text-xs space-y-3.5 text-slate-700 pl-1">
                      {experience ? (
                        experience.split('\n').map((line, i) => {
                          if (line.startsWith('-')) {
                            return (
                              <li key={i} className="list-disc pl-2 ml-4 text-[11px] leading-relaxed text-slate-600">
                                {line.replace(/^-/, '').trim()}
                              </li>
                            );
                          }
                          return <p key={i} className="font-bold text-slate-900 mt-2 text-[11.5px]">{line}</p>;
                        })
                      ) : (
                        <p className="italic text-slate-400">Experience not populated</p>
                      )}
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 text-slate-700 mb-2 border-l-4" style={{ ...accentBorder, backgroundColor: '#f1f5f9' }}>
                      Technical Core Competencies
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-xs text-slate-700 pl-1">
                      {skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-[10px]" style={accentText}>■</span>
                          <span className="font-medium text-[11px]">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 text-slate-700 mb-2 border-l-4" style={{ ...accentBorder, backgroundColor: '#f1f5f9' }}>
                      Academic Credentials
                    </h3>
                    <div className="text-xs text-slate-700 pl-1 font-medium">
                      {education ? (
                        education.split('\n').map((line, i) => <p key={i} className="leading-relaxed">{line}</p>)
                      ) : (
                        <p className="italic text-slate-400">Education not entered yet</p>
                      )}
                    </div>
                  </div>

                  {/* Certifications, Languages, Awards in a clean grid */}
                  {(certifications || languages || awards) && (
                    <div className="grid grid-cols-3 gap-4 border-t pt-3 border-slate-100 mt-1">
                      {certifications && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Certifications</h4>
                          <div className="text-[10px] text-slate-600 space-y-0.5 font-medium">
                            {certifications.split('•').map((cert, i) => <p key={i}>{cert.trim()}</p>)}
                          </div>
                        </div>
                      )}

                      {languages && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Languages</h4>
                          <p className="text-[10px] text-slate-600 font-medium">{languages}</p>
                        </div>
                      )}

                      {awards && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Honors & Awards</h4>
                          <div className="text-[10px] text-slate-600 space-y-0.5 font-medium">
                            {awards.split('•').map((award, i) => <p key={i}>{award.trim()}</p>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LAYOUT 3: MINIMAL CLEAN */}
              {resumeTheme === 'minimalist' && (
                <div className="flex flex-col gap-4 flex-1">
                  {/* Ultra Minimal Left Header */}
                  <div>
                    <h1 className="text-4xl font-light text-slate-900 tracking-tight leading-none">{name || 'Your Name'}</h1>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                      <span className="font-bold uppercase tracking-widest" style={accentText}>
                        {role === 'custom' ? customRoleName : `${role} development`}
                      </span>
                      {email && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{email}</span>
                        </>
                      )}
                      {phone && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{phone}</span>
                        </>
                      )}
                      {location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{location}</span>
                        </>
                      )}
                      {linkedin && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>ln: {linkedin}</span>
                        </>
                      )}
                      {github && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>git: {github}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[1px] my-1" style={{ backgroundColor: '#f1f5f9' }} />

                  {/* Dynamic Experience Timeline */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Background</h3>
                      <p className="text-[11.5px] text-slate-600 leading-relaxed">
                        {getSummaryContent()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Selected Projects & History</h3>
                      <div className="text-xs space-y-3 pl-1">
                        {experience ? (
                          experience.split('\n').map((line, i) => {
                            if (line.startsWith('-')) {
                              return (
                                <p key={i} className="pl-3 text-[11px] leading-relaxed text-slate-500 border-l border-slate-200">
                                  {line.replace(/^-/, '').trim()}
                                </p>
                              );
                            }
                            return <p key={i} className="font-bold text-slate-800 mt-2 text-[11px] tracking-wide uppercase">{line}</p>;
                          })
                        ) : (
                          <p className="italic text-slate-400">Experience not populated</p>
                        )}
                      </div>
                    </div>

                    {/* Skill Pills */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Expertise Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span
                            key={i}
                            className="text-[9.5px] px-2 py-0.5 rounded-full text-slate-600 font-medium"
                            style={{ backgroundColor: '#f1f5f9' }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Academic Credentials</h3>
                      <div className="text-[11px] text-slate-600 pl-1 font-medium">
                        {education ? (
                          education.split('\n').map((line, i) => <p key={i} className="leading-relaxed">{line}</p>)
                        ) : (
                          <p className="italic text-slate-400">Education not entered yet</p>
                        )}
                      </div>
                    </div>

                    {/* Certifications, Languages, Awards in minimalist clean inline block */}
                    {(certifications || languages || awards) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3 mt-1">
                        {certifications && (
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Certifications</h3>
                            <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                              {certifications.split('•').map((cert, i) => <p key={i}>{cert.trim()}</p>)}
                            </div>
                          </div>
                        )}

                        {languages && (
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Languages</h3>
                            <p className="text-[10px] text-slate-500 font-medium">{languages}</p>
                          </div>
                        )}

                        {awards && (
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Honors & Awards</h3>
                            <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                              {awards.split('•').map((award, i) => <p key={i}>{award.trim()}</p>)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LAYOUT 4: BLACK ON TOP (MIDNIGHT SPLIT) */}
              {resumeTheme === 'blackontop' && (
                <div className="flex flex-col flex-1 -m-8 relative overflow-hidden bg-white">
                  {/* Premium Midnight Black Header Banner */}
                  <div className="bg-[#0f172a] text-white p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-600/10 to-transparent pointer-events-none" />
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">{name || 'Your Name'}</h1>
                      <p className="text-xs font-extrabold uppercase tracking-widest mt-1.5 animate-pulse" style={{ color: currentAccent.hex }}>
                        {role === 'custom' ? customRoleName : `${role.charAt(0).toUpperCase() + role.slice(1)} Architect`}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-300 space-y-0.5 md:border-l md:border-white/10 md:pl-4">
                      {email && <p className="font-semibold text-white">{email}</p>}
                      {phone && <p className="font-medium text-slate-200">{phone}</p>}
                      {location && <p className="text-slate-400">{location}</p>}
                      <div className="flex flex-col items-end gap-0.5 mt-1 text-[10px] text-slate-500">
                        {linkedin && <span>LinkedIn: {linkedin}</span>}
                        {github && <span>GitHub: {github}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Clean White Body */}
                  <div className="p-8 flex flex-col gap-6 flex-1 text-slate-800">
                    {/* Summary */}
                    <div>
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={accentBg} />
                        Professional Summary
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l border-slate-100">
                        {getSummaryContent()}
                      </p>
                    </div>

                    {/* Split details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                      {/* Left: Skills & Info */}
                      <div className="md:col-span-4 flex flex-col gap-5">
                        <div>
                          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-b pb-1">Technical Skills</h3>
                          <div className="flex flex-wrap gap-1">
                            {skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                              <span
                                key={i}
                                className="text-[9.5px] font-semibold px-2 py-0.5 rounded border text-slate-700 hover:bg-slate-100/50 transition-colors"
                                style={{ backgroundColor: '#f8fafc', borderColor: `${currentAccent.hex}22`, borderLeftWidth: '3px', borderLeftColor: currentAccent.hex }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-b pb-1">Academic Profile</h3>
                          <div className="text-xs text-slate-600 pl-1 leading-relaxed">
                            {education ? (
                              education.split('\n').map((line, i) => <p key={i} className="mb-1 font-medium">{line}</p>)
                            ) : (
                              <p className="italic text-slate-400">Credentials not loaded</p>
                            )}
                          </div>
                        </div>

                        {certifications && (
                          <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-b pb-1">Certifications</h3>
                            <div className="text-[10px] text-slate-600 pl-1 space-y-1 font-medium leading-relaxed">
                              {certifications.split('•').map((cert, i) => <p key={i}>{cert.trim()}</p>)}
                            </div>
                          </div>
                        )}

                        {languages && (
                          <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-b pb-1">Languages</h3>
                            <p className="text-xs text-slate-600 pl-1 font-medium leading-relaxed">{languages}</p>
                          </div>
                        )}

                        {awards && (
                          <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-b pb-1">Honors & Awards</h3>
                            <div className="text-[10px] text-slate-600 pl-1 space-y-1 font-medium leading-relaxed">
                              {awards.split('•').map((award, i) => <p key={i}>{award.trim()}</p>)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: History */}
                      <div className="md:col-span-8 flex flex-col gap-4">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b pb-1">Selected Projects & History</h3>
                        <div className="text-xs space-y-4 pl-1">
                          {experience ? (
                            experience.split('\n').map((line, i) => {
                              if (line.startsWith('-')) {
                                return (
                                  <div key={i} className="flex gap-2 items-start pl-2 text-[11px] leading-relaxed text-slate-600">
                                    <span className="text-[10px] mt-0.5" style={accentText}>•</span>
                                    <span>{line.replace(/^-/, '').trim()}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={i} className="font-bold text-slate-900 mt-3 text-[11.5px] uppercase tracking-wide flex items-center justify-between">
                                  <span>{line}</span>
                                </p>
                              );
                            })
                          ) : (
                            <p className="italic text-slate-400">Experience template empty</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LAYOUT 5: WORLD TOP CV (FULL PAGE MODERN PREMIUM) */}
              {resumeTheme === 'worldtop' && (
                <div className="flex flex-col flex-1 bg-white px-2 py-4 text-slate-800">
                  {/* Premium Centered Header */}
                  <div className="text-center pb-6 border-b-2" style={{ borderColor: `${currentAccent.hex}33` }}>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900 mb-2">{name || 'Your Name'}</h1>
                    <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: currentAccent.hex }}>
                      {role === 'custom' ? customRoleName : `${role} Specialist`}
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] text-slate-600 font-medium tracking-wide">
                      {email && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={accentBg} /> {email}</span>}
                      {phone && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={accentBg} /> {phone}</span>}
                      {location && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={accentBg} /> {location}</span>}
                      {linkedin && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={accentBg} /> {linkedin}</span>}
                      {github && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={accentBg} /> {github}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 mt-6">
                    {/* Executive Summary */}
                    <div className="p-5 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={accentBg} />
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-2">Executive Summary</h3>
                      <p className="text-[12.5px] text-slate-600 leading-relaxed text-justify font-medium">
                        {getSummaryContent()}
                      </p>
                    </div>

                    {/* Professional Experience */}
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                        Professional Experience
                      </h3>
                      <div className="space-y-5 pl-1">
                        {experience ? (
                          experience.split('\n').map((line, i) => {
                            if (line.startsWith('-')) {
                              return (
                                <div key={i} className="flex gap-3 items-start pl-4 text-[12px] leading-relaxed text-slate-600">
                                  <span className="text-[14px] mt-[-1px]" style={accentText}>▹</span>
                                  <span className="font-medium">{line.replace(/^-/, '').trim()}</span>
                                </div>
                              );
                            }
                            return (
                              <p key={i} className="font-bold text-slate-900 mt-4 text-[13px] uppercase tracking-wider flex items-center justify-between py-1.5 px-3 rounded-md" style={{ backgroundColor: '#f8fafc' }}>
                                <span>{line}</span>
                              </p>
                            );
                          })
                        ) : (
                          <p className="italic text-slate-400 text-sm">Experience template empty</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      {/* Left: Skills & Languages */}
                      <div className="flex flex-col gap-6">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                            Core Competencies
                          </h3>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                              <span
                                key={i}
                                className="text-[10.5px] font-bold px-3 py-1 rounded-full text-slate-700 bg-white border shadow-sm"
                                style={{ borderColor: `${currentAccent.hex}40` }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {languages && (
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                              Languages
                            </h3>
                            <p className="text-[12.5px] text-slate-600 font-medium leading-relaxed">{languages}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Education & Certs */}
                      <div className="flex flex-col gap-6">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                            Education
                          </h3>
                          <div className="text-[12.5px] text-slate-600 font-medium leading-relaxed">
                            {education ? (
                              education.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)
                            ) : (
                              <p className="italic text-slate-400">Credentials not loaded</p>
                            )}
                          </div>
                        </div>

                        {certifications && (
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                              Certifications
                            </h3>
                            <div className="text-[12.5px] text-slate-600 font-medium leading-relaxed space-y-1">
                              {certifications.split('•').map((cert, i) => <p key={i} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-300" /> {cert.trim()}</p>)}
                            </div>
                          </div>
                        )}

                        {awards && (
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3 border-b-2 pb-1 inline-block" style={{ borderColor: currentAccent.hex }}>
                              Honors & Awards
                            </h3>
                            <div className="text-[12.5px] text-slate-600 font-medium leading-relaxed space-y-1">
                              {awards.split('•').map((award, i) => <p key={i} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-300" /> {award.trim()}</p>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ================= FULL WIDTH BOTTOM PANEL: ATS DIAGNOSTICS & ACTIONS (12 cols) ================= */}
        <section className="lg:col-span-12 mt-6 animate-fade-in">
          <div className="backdrop-blur-xl bg-slate-900/35 border border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Cyberpunk grid accent lines */}
            <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-violet-500/20 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-cyan-500/20 rounded-bl-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-300">
                  ATS Diagnostics & Action Console
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                SYS_STATUS: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Radial Gauges & Ticks (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/45 border border-white/5 relative">
                {/* Dial Gauge background ticks */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-36 h-36 rounded-full border border-dashed border-slate-500" />
                  <div className="absolute w-40 h-40 rounded-full border border-double border-slate-700" />
                </div>

                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="text-slate-950"
                      strokeWidth="2.5"
                      stroke="currentColor"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="text-slate-800"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      strokeDasharray="4, 2"
                    />
                    {/* Active Match Track */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="transition-all duration-1000 ease-out"
                      strokeWidth="2.5"
                      strokeDasharray={`${atsScore}, 100`}
                      strokeLinecap="round"
                      stroke={atsScore >= 80 ? '#10b981' : atsScore >= 40 ? '#f59e0b' : '#f43f5e'}
                    />
                    {/* Glowing outer progress */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="transition-all duration-1000 ease-out opacity-35 blur-[3px]"
                      strokeWidth="4"
                      strokeDasharray={`${atsScore}, 100`}
                      strokeLinecap="round"
                      stroke={atsScore >= 80 ? '#10b981' : atsScore >= 40 ? '#f59e0b' : '#f43f5e'}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-3xl font-black font-mono tracking-tight text-white">{atsScore}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Match Index</span>
                  </div>
                </div>

                <div className="text-center mt-4 space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">ATS Parity</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${
                      atsScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      atsScore >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {atsScore >= 80 ? 'Optimal Match' : atsScore >= 40 ? 'Moderate Match' : 'Critical Discrepancy'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis & Connectivity Map (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keyword Coverage Index</span>
                  <span className="text-[10px] font-mono text-violet-400 font-bold">
                    {missingSkills.length === 0 ? "100% Coverage" : `${missingSkills.length} Missing Keywords`}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 min-h-[120px] flex flex-col justify-between">
                  {missingSkills.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-300 font-semibold">Perfect keyword alignment established!</p>
                      <p className="text-[10px] text-slate-500">Your resume is fully calibrated for the target profile.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Unmatched Target Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono font-bold uppercase flex items-center gap-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-400 font-medium">Bypass scanner filters in one click:</p>
                        <button
                          onClick={applyMissingSkills}
                          className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/15"
                        >
                          <Sparkles className="w-3 h-3" />
                          Auto-Inject Skills
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono uppercase tracking-wider">
                  <div className="p-2 rounded bg-slate-950/20 border border-white/[0.02] flex items-center justify-between text-slate-400">
                    <span>Formatting Audit</span>
                    <span className="text-emerald-400 font-bold">✓ Clear</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/20 border border-white/[0.02] flex items-center justify-between text-slate-400">
                    <span>Contact Info Check</span>
                    <span className={email && phone ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {email && phone ? "✓ Present" : "⚠ Missing"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 text-center lg:text-left">
                  Console Actions
                </label>
                
                <button
                  onClick={enhanceResume}
                  className="w-full px-4 py-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-900 border border-white/[0.06] hover:border-violet-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-violet-950/10"
                >
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span>AI Enhance CV</span>
                </button>

                <button
                  onClick={saveResumeDraft}
                  className="w-full px-4 py-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-900 border border-white/[0.06] hover:border-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-indigo-950/10"
                >
                  <Save className="w-4 h-4 text-indigo-400" />
                  <span>Save Profile</span>
                </button>

                <button
                  onClick={exportPDF}
                  className="w-full px-4 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-xl shadow-violet-700/20 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer font-sans"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Premium PDF</span>
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-350 bg-slate-950 hover:bg-rose-950/15 border border-rose-500/20 hover:border-rose-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Clear All CV</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FULL WIDTH: SKILLS SYNAPSES NEURO RADAR ================= */}
        <section className="lg:col-span-12 mt-6 animate-fade-in">
          <div className="backdrop-blur-xl bg-slate-900/25 border border-white/[0.04] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/[0.04] pb-4 mb-8 gap-4">
              <div>
                <h3 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-violet-400" />
                  SkillSync Neuro-Mapping Radar
                </h3>
                <p className="text-slate-400 text-[11px] mt-1">
                  Dynamic vector mapping measuring CV density, profiles parity, keywords structure, and social reachability.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Telemetry Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive SVG Radar Chart (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/30 rounded-2xl border border-white/[0.03]">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Multi-Dimensional Index
                </span>
                
                {/* SVG Radar Chart Wrapper */}
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Pentagon Grid lines */}
                    <polygon points={getPentagonPoints(1.0)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <polygon points={getPentagonPoints(0.8)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <polygon points={getPentagonPoints(0.6)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <polygon points={getPentagonPoints(0.4)} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <polygon points={getPentagonPoints(0.2)} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Axis lines */}
                    {angles.map((angle, index) => {
                      const x2 = center + radius * Math.cos(angle);
                      const y2 = center + radius * Math.sin(angle);
                      return (
                        <line
                          key={index}
                          x1={center}
                          y1={center}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                          strokeDasharray="2, 2"
                        />
                      );
                    })}

                    {/* Filled Radar Data Polygon */}
                    <polygon
                      points={radarPoints}
                      fill="rgba(139, 92, 246, 0.15)"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Data Polygon outer glow */}
                    <polygon
                      points={radarPoints}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      className="transition-all duration-700 ease-out opacity-40 blur-[1px]"
                    />

                    {/* Glowing Vertex Dots */}
                    {radarValues.map((val, i) => {
                      const r = (val / maxVal) * radius;
                      const cx = center + r * Math.cos(angles[i]);
                      const cy = center + r * Math.sin(angles[i]);
                      return (
                        <g key={i} className="transition-all duration-700 ease-out">
                          <circle cx={cx} cy={cy} r="4" fill="#06b6d4" />
                          <circle cx={cx} cy={cy} r="8" fill="#8b5cf6" className="animate-ping opacity-25" />
                        </g>
                      );
                    })}

                    {/* Labels */}
                    <text x="100" y="15" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">PROFICIENCY</text>
                    <text x="182" y="75" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start" fontFamily="monospace">KEYWORDS</text>
                    <text x="160" y="180" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">COMPLETENESS</text>
                    <text x="40" y="180" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SOCIAL</text>
                    <text x="18" y="75" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end" fontFamily="monospace">STRUCTURE</text>
                  </svg>
                </div>
              </div>

              {/* Right Column: Skill Synapses & Diagnostic Dashboard Matrix (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Active Synapses: Technical Keyword Connector
                  </h4>
                  
                  {/* Interactive Nodes and Connections */}
                  <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/[0.04] relative overflow-hidden min-h-[170px] flex flex-col justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e1b4b10_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                      {(ROLE_SKILLS[role] || []).map((skill, index) => {
                        const isMatched = skills.toLowerCase().includes(skill.toLowerCase());
                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 ${
                              isMatched 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.03)]' 
                                : 'bg-rose-500/5 border-rose-500/10 text-slate-500'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isMatched ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`} />
                            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">{skill}</span>
                            <span className="text-[8px] uppercase font-bold text-slate-500">
                              {isMatched ? 'Link OK' : 'No Link'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Vector Metrics readouts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/20 border border-white/[0.03]">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1">Vector Alignment</span>
                    <span className="text-sm font-extrabold text-white font-mono">{profVal}% Match</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${profVal}%` }} />
                    </div>
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-slate-950/20 border border-white/[0.03]">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1">Completeness Index</span>
                    <span className="text-sm font-extrabold text-white font-mono">{completeVal}% Filled</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${completeVal}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/20 border border-white/[0.03]">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1">Profile Reachability</span>
                    <span className="text-sm font-extrabold text-white font-mono">{socialVal}% Score</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${socialVal}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ----------------- CV MAKER ATTRACTIONS / FEATURE SHOWCASE ----------------- */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 border-t border-white/[0.04] mb-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] bg-violet-400/5 border border-violet-500/10 px-3 py-1.5 rounded-full">
            The SkillSync Advantage
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-4 mb-3">
            Supercharge Your Job Search
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
            SkillSync is not just another resume form. It is a full-featured CV operating system designed to elevate your professional narrative and bypass hiring barriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: ATS */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/[0.05] hover:border-violet-500/30 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-2 group-hover:text-white transition-colors">
              ATS Core Scanning
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
              Real-time semantic analysis matches your skills directly with target requirements to bypass initial scanner filters automatically.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1 text-[9px] text-violet-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Optimized Scoring</span>
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: AI Enhancer */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-2 group-hover:text-white transition-colors">
              AI Phrase Polish
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
              One-click professional optimization refines job descriptions with dynamic action verbs and impactful syntax alignment.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1 text-[9px] text-indigo-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Neural Generator</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Supabase Sync */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/[0.05] hover:border-emerald-500/30 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CloudLightning className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-2 group-hover:text-white transition-colors">
              Instant Cloud Sync
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
              Continuous auto-saving to your secure cloud database profile keeps your drafts synced across devices instantly and securely.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Supabase Cloud</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Layout Switcher */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/[0.05] hover:border-pink-500/30 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200 mb-2 group-hover:text-white transition-colors">
              Cinematic Presets
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
              Switch layouts instantly from tech modern to corporate minimal with curated font structures and vibrant glow options.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1 text-[9px] text-pink-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Vibrant Presets</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* ----------------- PAGE 2: INTELLIGENCE CONSOLE ----------------- */}
      {currentPage === 'intelligence' && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 animate-fade-in">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-white/[0.04] p-6 rounded-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-400 animate-pulse" />
                SkillSync AI Intelligence Console
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time career projections, mock interview simulators, and automated cover letter composing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold tracking-wider uppercase font-mono">
                Neural Core v4.1
              </span>
            </div>
          </div>

          {/* API Key Connection Strip */}
          <div className="bg-slate-900/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="text-left font-sans">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Gemini AI Engine Status</span>
                <span className="text-[9px] text-emerald-400 font-mono">
                  Active (Secure API Key Connected)
                </span>
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-500 bg-[#090b11] px-2.5 py-1 rounded border border-white/[0.03]">
              gemini-2.5-flash
            </div>
          </div>

          {/* Grid Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Recruiter Telemetry (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/20 border border-white/[0.05] rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Recruitability Scorecard
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Real-time analysis against corporate HR pipelines</p>
              </div>

              {/* Animated Progress Gauge */}
              <div className="flex flex-col items-center py-6 relative">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-slate-950/40"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-violet-500"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="402"
                      strokeDashoffset={402 - (402 * atsScore) / 100}
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-3xl font-black text-white">{atsScore}%</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">ATS Parity</span>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <span className="px-2.5 py-1 rounded bg-slate-950/60 border border-white/[0.04] text-slate-300 text-[10px] font-mono">
                    Match Status: <span className={atsScore >= 80 ? "text-emerald-400 font-bold" : atsScore >= 50 ? "text-amber-400 font-bold" : "text-rose-400 font-bold"}>
                      {atsScore >= 80 ? "EXECUTIVE MATCH" : atsScore >= 50 ? "INTERMEDIATE" : "ACTION REQUIRED"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="space-y-3 font-mono text-[10px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Keyword Structure Density</span>
                    <span className="text-slate-200 font-bold">{atsScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${atsScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Semantic Integrity</span>
                    <span className="text-slate-200 font-bold">{skills ? '95%' : '0%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400" style={{ width: skills ? '95%' : '0%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Formatting Parity</span>
                    <span className="text-slate-200 font-bold">{name && email ? '100%' : '50%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: name && email ? '100%' : '50%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Global Reachability</span>
                    <span className="text-slate-200 font-bold">{linkedin || github ? '90%' : '30%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400" style={{ width: linkedin || github ? '90%' : '30%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Cover Letter / Simulators (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Cover Letter Composer */}
              <div className="bg-slate-900/20 border border-white/[0.05] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400" />
                      AI Cover Letter Composer
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Synthesize professional introduction letters matching your active CV</p>
                  </div>
                  
                  <button
                    onClick={handleComposeLetter}
                    disabled={isGeneratingLetter}
                    className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-700/20"
                  >
                    {isGeneratingLetter ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Composing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Compose Letter</span>
                      </>
                    )}
                  </button>
                </div>

                {coverLetter ? (
                  <div className="space-y-3 animate-slide-down">
                    <textarea
                      readOnly
                      value={coverLetter}
                      className="w-full h-48 bg-slate-950/80 border border-white/[0.06] rounded-xl p-4 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetter);
                          triggerNotification("Copied to clipboard!", "success");
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white bg-slate-950 border border-white/[0.06] transition-all cursor-pointer"
                      >
                        Copy to Clipboard
                      </button>
                      <button
                        onClick={() => setCoverLetter('')}
                        className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-white/[0.02] transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-white/[0.06] bg-slate-950/20 flex flex-col items-center justify-center text-slate-500 text-[11px]">
                    <FileText className="w-7 h-7 mb-1.5 text-slate-700" />
                    <span>No letter generated yet. Click Compose to build one automatically.</span>
                  </div>
                )}
              </div>

              {/* AI Mock Interview Simulator */}
              <div className="bg-slate-900/20 border border-white/[0.05] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-rose-400" />
                    AI Mock Interview Simulator
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Test your answers against recruiter core questions based on your profile</p>
                </div>

                {/* Questions tabs */}
                <div className="flex gap-2">
                  {[1, 2, 3].map((num, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQuestionIndex(i);
                        setInterviewAnswer('');
                        setInterviewFeedback('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                        selectedQuestionIndex === i
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-350'
                          : 'border-white/[0.04] bg-slate-950/20 text-slate-400 hover:text-slate-350'
                      }`}
                    >
                      Question {num}
                    </button>
                  ))}
                </div>

                {/* Selected Question */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.04] text-[11px] leading-relaxed text-slate-200">
                  <span className="font-bold text-rose-400 block mb-1">PROMPT:</span>
                  {role === 'frontend'
                    ? [
                        "How do you optimize page loading performance and asset rendering speed in React 19?",
                        "What is the difference between client-side rendering (CSR) and server-side rendering (SSR), and when would you use each?",
                        "How does TypeScript's strict typing system improve structural safety in complex frontend codebases?"
                      ][selectedQuestionIndex]
                    : role === 'backend'
                    ? [
                        "How do you design a database schema for high-throughput, concurrent write operations?",
                        "Explain key mechanisms to prevent race conditions and ensure transactional safety in Express/PostgreSQL.",
                        "What are the trade-offs of microservices architectures vs monolithic architectures in backend scaling?"
                      ][selectedQuestionIndex]
                    : [
                        "What are the typical stages of data cleaning and formatting before applying machine learning regressions?",
                        "How do you translate heavy raw SQL records into visual dashboard KPIs for executive stakeholders?",
                        "What is the statistical significance of p-value, and how does it affect business demographic analysis?"
                      ][selectedQuestionIndex]
                  }
                </div>

                <div className="space-y-3">
                  <textarea
                    value={interviewAnswer}
                    onChange={(e) => setInterviewAnswer(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full h-24 bg-slate-950/80 border border-white/[0.06] rounded-xl p-3.5 text-[11px] text-slate-300 focus:outline-none focus:border-rose-500/40 resize-none placeholder:text-slate-600 font-sans"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500">Suggested length: 1-3 sentences.</span>
                    <button
                      onClick={handleSubmitInterviewAnswer}
                      disabled={isAnalyzingAnswer || !interviewAnswer.trim()}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/20"
                    >
                      {isAnalyzingAnswer ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {interviewFeedback && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/20 text-[10px] font-mono text-slate-300 animate-slide-down">
                    <span className="text-rose-400 font-bold block mb-1">AI TELEMETRY FEEDBACK:</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{interviewFeedback}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PAGE 3: THEME SHOWROOM ----------------- */}
      {currentPage === 'showroom' && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 animate-fade-in">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-white/[0.04] p-6 rounded-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-400" />
                SkillSync Design Gallery & Showroom
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore preset templates designed to meet recruitment standards across engineering and analytics.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 bg-[#090b11] px-2.5 py-1 rounded-md border border-white/[0.03] uppercase tracking-widest font-mono">
              Curated Fonts & Offsets
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              { id: 'modern', label: 'Tech Grid (Modern)', desc: 'Optimized for software engineers with accent sidebar telemetry and clear keyword grids.', accent: '#8b5cf6', accentName: 'Violet Glow' },
              { id: 'classic', label: 'Classic Corporate', desc: 'A traditional top-to-bottom layout focusing on linear experience and bold headers.', accent: '#10b981', accentName: 'Tech Emerald' },
              { id: 'minimalist', label: 'Cyber Minimalist', desc: 'Lightweight layout stripping away heavy board lines in favor of elegant text flow and clean borders.', accent: '#06b6d4', accentName: 'Cyber Cyan' },
              { id: 'blackontop', label: 'Obsidian Header', desc: 'Features a dark obsidian header band block contrast to emphasize contact coordinates and profile statement.', accent: '#f43f5e', accentName: 'Sunset Crimson' },
              { id: 'worldtop', label: 'Executive Radar', desc: 'Wide format spacing highlighting multi-role education lists, languages, and certifications.', accent: '#f59e0b', accentName: 'Cyber Amber' }
            ] as const).map((themeItem) => (
              <div
                key={themeItem.id}
                onClick={() => {
                  const targetAccent = themeItem.id === 'modern' ? 'violet' : themeItem.id === 'classic' ? 'emerald' : themeItem.id === 'minimalist' ? 'cyan' : themeItem.id === 'blackontop' ? 'rose' : 'amber';
                  setResumeTheme(themeItem.id);
                  setAccentColor(targetAccent);
                  syncThemeToCache(themeItem.id, targetAccent);
                  setCurrentPage('builder');
                  triggerNotification(`Applied ${themeItem.label} theme with ${themeItem.accentName} accent!`, "success");
                  confetti({
                    particleCount: 60,
                    spread: 50,
                    origin: { y: 0.8 }
                  });
                }}
                className={`group relative p-6 rounded-2xl bg-slate-900/20 border transition-all duration-300 shadow-xl overflow-hidden cursor-pointer flex flex-col gap-4 ${
                  resumeTheme === themeItem.id
                    ? 'border-violet-500/50 bg-violet-600/[0.02]'
                    : 'border-white/[0.04] hover:border-white/[0.15] hover:bg-white/[0.01]'
                }`}
              >
                {/* Accent line top */}
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: themeItem.accent }} />

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-205 group-hover:text-white transition-colors">
                      {themeItem.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {themeItem.desc}
                    </p>
                  </div>
                  {resumeTheme === themeItem.id && (
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[9px] font-bold uppercase border border-violet-500/30 font-mono">
                      Active
                    </span>
                  )}
                </div>

                {/* Mock Miniature Preview Block */}
                <div className="w-full h-36 rounded-xl bg-slate-950 border border-white/[0.06] p-3 flex flex-col gap-2 relative overflow-hidden group-hover:border-white/[0.12] transition-colors select-none">
                  {/* Mock resume header */}
                  {themeItem.id === 'blackontop' ? (
                    <div className="h-6 w-full bg-slate-800/80 rounded flex items-center px-1.5 justify-between">
                      <div className="w-8 h-2 bg-slate-600 rounded" />
                      <div className="w-12 h-1 bg-slate-600 rounded" />
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="w-12 h-2.5 bg-slate-850 rounded" />
                        <div className="w-8 h-1 bg-slate-850 rounded" />
                      </div>
                      <div className="w-14 h-1.5 bg-slate-850 rounded" />
                    </div>
                  )}

                  {/* Mock content blocks */}
                  <div className="flex gap-2 flex-1">
                    <div className="flex-1 space-y-1.5">
                      <div className="w-full h-1 bg-slate-900 rounded" />
                      <div className="w-[90%] h-1 bg-slate-900 rounded" />
                      <div className="w-[95%] h-1 bg-slate-900/60 rounded" />
                      
                      <div className="pt-1.5 space-y-1">
                        <div className="w-10 h-2 bg-slate-900 rounded" style={{ backgroundColor: `${themeItem.accent}22` }} />
                        <div className="w-full h-1 bg-slate-900 rounded" />
                        <div className="w-[85%] h-1 bg-slate-900 rounded" />
                      </div>
                    </div>
                    {themeItem.id === 'modern' && (
                      <div className="w-14 bg-slate-900/50 rounded p-1 space-y-1">
                        <div className="w-8 h-1.5 bg-slate-950 rounded" />
                        <div className="w-10 h-1 bg-slate-950 rounded" />
                        <div className="w-9 h-1 bg-slate-950 rounded" />
                        <div className="w-7 h-1 bg-slate-950 rounded" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/[0.04]">
                  <span className="text-slate-500 font-mono">Accent preset:</span>
                  <span className="font-bold font-mono" style={{ color: themeItem.accent }}>
                    {themeItem.accentName}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gallery Footer design tips */}
          <div className="bg-slate-900/20 border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              HR Typography & Style Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-400 leading-relaxed font-medium">
              <div className="space-y-1">
                <span className="font-bold text-slate-350 block">1. Font Hierarchy</span>
                <p>Keep body font dimensions between 10px and 12px for standard letter readability. Headlines should remain below 24px to prevent scanning issues.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-350 block">2. White Space Balance</span>
                <p>Ensure that content blocks leave approximately 20-30% of whitespace on the page to prevent reader fatigue and let sections breathe.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-350 block">3. Digital Interoperability</span>
                <p>Avoid excessive graphics or sideboards if applying to major applicant tracking platforms (Taleo, Workday), which favor linear CSS blocks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PAGE 4: GLOBAL JOB DEMANDS (REAL-TIME DEMANDS REPORT) ----------------- */}
      {currentPage === 'demand' && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 animate-fade-in text-left">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-white/[0.04] p-6 rounded-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-400" />
                Global Hiring & Job Demands Intelligence
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Query live Google Search Trends, salary ranges, and hiring demand telemetry across regional engineering hubs.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 bg-[#090b11] px-2.5 py-1 rounded-md border border-white/[0.03] uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
              <span>Real-Time Index Feed</span>
            </div>
          </div>

          {/* Search bar row */}
          <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <TrendingUp className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={demandQuery}
                onChange={(e) => setDemandQuery(e.target.value)}
                placeholder="Enter job title (e.g. Full Stack Developer, React Architect, DevOps Engineer)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all font-sans"
              />
            </div>
            <button
              onClick={() => fetchJobDemandData(demandQuery)}
              disabled={isFetchingDemand}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isFetchingDemand ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Market...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fetch Real-Time Trends</span>
                </>
              )}
            </button>
          </div>

          {demandData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Score & Salaries & Regions (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Score & Growth Telemetry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Global Demand Score</span>
                      <span className="text-3xl font-black text-white mt-1 block">
                        {demandData.globalDemandScore}<span className="text-xs text-slate-500"> / 100</span>
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-violet-500/20 flex items-center justify-center relative">
                      <span className="text-xs font-black text-violet-400">{demandData.globalDemandScore}%</span>
                      {/* Visual Ring Overlay */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-violet-500"
                          strokeDasharray="125"
                          strokeDashoffset={125 - (125 * demandData.globalDemandScore) / 100}
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Hiring Growth Rate</span>
                    <span className="text-3xl font-black text-emerald-400 mt-1 block">
                      {demandData.growthForecast}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono mt-0.5 block">Estimated annual demand shift</span>
                  </div>
                </div>

                {/* Salary Benchmarks */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2 flex justify-between items-center">
                    <span>Target Annual Salary Benchmarks</span>
                    <span className="text-[9px] text-slate-500 lowercase font-mono">amounts in USD</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Entry level */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Junior / Entry Level</span>
                        <span className="text-white">${demandData.averageSalaryUSD?.entry?.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/[0.02]">
                        <div className="bg-slate-500 h-full rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>

                    {/* Mid level */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">Senior Professional / Tech Lead</span>
                        <span className="text-violet-400">${demandData.averageSalaryUSD?.mid?.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/[0.02]">
                        <div className="bg-violet-500 h-full rounded-full animate-pulse" style={{ width: '65%' }} />
                      </div>
                    </div>

                    {/* Senior level */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-200">Principal Engineer / Architect</span>
                        <span className="text-emerald-400">${demandData.averageSalaryUSD?.senior?.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/[0.02]">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regions Grid */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2">
                    Global Demand Hotspots & Hubs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {demandData.topRegions?.map((r: any, i: number) => (
                      <div key={i} className="bg-[#090b11]/60 border border-white/[0.03] p-4 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
                          <span className="text-xs font-black text-slate-200">{r.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase font-mono ${
                            r.demandLevel === 'Critical' || r.demandLevel === 'Extreme'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {r.demandLevel}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.hotspots?.map((city: string, ci: number) => (
                            <span key={ci} className="text-[9.5px] px-2 py-0.5 rounded bg-slate-900 border border-white/[0.05] text-slate-400">
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Skill Tags & Trends & Job Feed (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Skill demand frequency list */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2">
                    In-Demand Skills Frequency
                  </h3>
                  <div className="space-y-3 pt-1">
                    {demandData.demandedSkills?.map((s: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-350">{s.skill}</span>
                          <span className="font-mono text-slate-500 text-[10px]">{s.category} • {s.frequencyPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-violet-500 h-full rounded-full" style={{ width: `${s.frequencyPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Search trends mockup */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2 flex justify-between items-center">
                    <span>Google Search Interest</span>
                    <span className="text-[9px] text-slate-500 font-mono">index 0-100</span>
                  </h3>
                  
                  <div className="flex justify-between items-end h-24 pt-4 px-2 border-b border-white/[0.05]">
                    {demandData.googleSearchInterestTrend?.map((t: any, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group">
                        <div className="w-4 bg-violet-500/20 group-hover:bg-violet-500 rounded-t transition-all relative" style={{ height: `${t.interest * 0.7}px` }}>
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-white/10 text-[9px] font-mono font-bold text-violet-400 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {t.interest}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{t.month}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1 text-center">
                    Hover columns to view historical monthly interest telemetry
                  </p>
                </div>

                {/* Recent positions keywords */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2">
                    Recent Open Hiring Leads
                  </h3>
                  <div className="space-y-2 pt-1">
                    {demandData.recentOpenPositionsKeywords?.map((kw: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-[#090b11]/50 border border-white/[0.03] text-[10.5px] font-semibold text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{kw}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/10 border border-white/[0.04] rounded-2xl p-8">
              <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Awaiting Demand Telemetry</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Type in your target role or query above to compile Google search interest, salary benchmarks, and hiring telemetry.
              </p>
            </div>
          )}

          {/* Market Intelligence Analysis Summary banner */}
          {demandData && (
            <div className="bg-slate-950/40 border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Market Trend Summary</span>
                <p className="text-xs text-slate-350 leading-relaxed font-medium mt-1">
                  {demandData.marketTrendSummary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- PAGE 5: CAREER PATHWAY ARCHITECT (TIMELINE ROADMAP) ----------------- */}
      {currentPage === 'pathway' && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 animate-fade-in text-left">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-white/[0.04] p-6 rounded-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Career Pathway Architect
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Design custom skill-acquisition timelines to map your trajectory from entry roles to C-suite/Architect positions.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 bg-[#090b11] px-2.5 py-1 rounded-md border border-white/[0.03] uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Blueprint Modeler</span>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Starting Position</label>
              <input
                type="text"
                value={pathwayStart}
                onChange={(e) => setPathwayStart(e.target.value)}
                placeholder="e.g. Junior Frontend Developer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans font-medium"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dream Target Position</label>
              <input
                type="text"
                value={pathwayEnd}
                onChange={(e) => setPathwayEnd(e.target.value)}
                placeholder="e.g. Chief Technology Officer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => generateCareerPathway(pathwayStart, pathwayEnd)}
                disabled={isGeneratingPathway}
                className="w-full md:w-auto px-6 py-2.5 h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPathway ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Architecting Route...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Build Pathway Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {pathwayData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Timeline Pathway Map (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900/20 border border-white/[0.04] p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500/80 via-violet-500/50 to-slate-800" />
                
                <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider border-b border-white/[0.05] pb-3 mb-6 flex justify-between items-center">
                  <span>Blueprint Milestones Timeline</span>
                  <span className="text-[10px] text-indigo-400 font-bold lowercase font-mono">est. duration: {pathwayData.totalEstYears}</span>
                </h3>

                <div className="space-y-8 relative z-10">
                  {pathwayData.milestones?.map((m: any, idx: number) => {
                    const skillIds = m.skillsToAcquire?.map((s: any) => s.id) || [];
                    const allCompleted = skillIds.length > 0 && skillIds.every((id: string) => completedCheckpoints.includes(id));
                    
                    return (
                      <div key={idx} className="flex gap-6 items-start group">
                        {/* Interactive milestone marker bubble */}
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                            allCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-950/20'
                              : 'bg-slate-950 border-white/10 text-slate-400 group-hover:border-indigo-500/50'
                          }`}
                        >
                          {allCompleted ? '✓' : `0${idx + 1}`}
                        </div>

                        {/* Card panel */}
                        <div className="flex-1 bg-[#090b11]/70 border border-white/[0.04] rounded-xl p-5 hover:border-white/[0.08] transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] pb-2.5 mb-3">
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{m.title}</h4>
                              <span className="text-[9.5px] text-slate-500 font-mono tracking-wide">{m.timeline}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black font-mono">
                              Est. ${m.avgSalaryUSD?.toLocaleString()}/yr
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-4 italic">
                            "{m.growthTip}"
                          </p>

                          {/* Skill acquisition checkboxes */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Required Competency Acquisitions:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.skillsToAcquire?.map((skill: any) => {
                                const checked = completedCheckpoints.includes(skill.id);
                                return (
                                  <label
                                    key={skill.id}
                                    className={`p-2.5 rounded-lg border transition-all flex items-center gap-2.5 cursor-pointer select-none text-[10.5px] font-semibold ${
                                      checked
                                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200'
                                        : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:border-white/[0.08] hover:bg-slate-950/60'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleCheckpoint(skill.id)}
                                      className="sr-only"
                                    />
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                      checked ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-700'
                                    }`}>
                                      {checked && <span className="text-[8px] font-bold">✓</span>}
                                    </div>
                                    <span className="truncate">{skill.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Guide (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Visual Telemetry Chart */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2">
                    Trajectory Progress Checklist
                  </h3>
                  
                  {(() => {
                    const totalSkills = pathwayData.milestones?.reduce((acc: number, cur: any) => acc + (cur.skillsToAcquire?.length || 0), 0) || 0;
                    const completedCount = completedCheckpoints.length;
                    const percent = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
                    
                    return (
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-400">Total Milestones Met</span>
                          <span className="font-mono text-indigo-400 font-bold">{completedCount} / {totalSkills} skills</span>
                        </div>
                        
                        <div className="w-full bg-slate-950 border border-white/[0.05] rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500 animate-pulse"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        
                        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed font-medium">
                          Check off skills inside milestone cards as you learn them to see your progress bar update in real-time!
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Professional Certification pathways */}
                <div className="bg-slate-900/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider border-b border-white/[0.05] pb-2">
                    Recommended Credentials
                  </h3>
                  <div className="space-y-2">
                    {[
                      { title: "AWS Solutions Architect Professional", level: "Senior / Architect" },
                      { title: "TOGAF Enterprise Architecture", level: "Staff / Director" },
                      { title: "Google Professional Cloud Architect", level: "Mid / Senior" }
                    ].map((cert, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#090b11]/50 border border-white/[0.03] text-[10px] text-left">
                        <span className="font-bold text-slate-200 block">{cert.title}</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{cert.level} tier</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/10 border border-white/[0.04] rounded-2xl p-8">
              <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Awaiting Pathway Blueprint</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Type in your starting role and dream target position above to generate an executive-level skill acquisition roadmap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer dock removed in favor of integrated workspace console panel */}

      {/* ----------------- MODAL: SAVED RESUMES DRAWER ----------------- */}
      {showSavedListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-violet-400" />
                <span>Saved Resume Drafts ({isSupabaseConfigured ? 'Supabase' : 'Sandbox'})</span>
              </h3>
              <button
                onClick={() => setShowSavedListModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {savedResumesList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <span>No saved resumes found in active workspace.</span>
                </div>
              ) : (
                savedResumesList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadSavedResume(item)}
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.04] hover:border-violet-500/30 hover:bg-violet-600/[0.02] flex items-center justify-between gap-4 transition-all cursor-pointer"
                  >
                    <div className="text-left space-y-1">
                      <p className="text-xs font-bold text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        Role: <span className="font-mono text-violet-400">{item.role === 'custom' ? item.customRoleName : item.role}</span>
                      </p>
                      <p className="text-[9px] text-slate-600">Last Sync: {item.savedAt}</p>
                    </div>

                    <button
                      onClick={(e) => deleteSavedResume(item.id, e)}
                      className="p-2 rounded-lg bg-white/[0.01] hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-white/[0.04] hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Remove draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-3 text-[10px] text-slate-500 text-center uppercase tracking-widest">
              Syncing live with Supabase cloud database
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CLEAR CONFIRMATION ----------------- */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                Confirm CV Clear
              </h3>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Are you sure you want to clear all fields? This will delete your current resume inputs. This action cannot be undone unless you have already saved your draft.
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 border border-white/[0.04] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCV}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/20 transition-all cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
