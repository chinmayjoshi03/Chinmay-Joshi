/**
 * All portfolio copy lives here — filled from the resume + public GitHub repos.
 * Edit freely; no component code needs to change.
 */

const GH = "https://github.com/chinmayjoshi03";

export const profile = {
  name: "CHINMAY JOSHI",
  role: "Software engineer · AI/ML & mobile",
  tagline: "first form: ship it",
  location: "Pune, India",
  bio: [
    "I'm an IT engineering student at I2IT Pune (B.E. 2027, CGPA 8.54) who builds production web and mobile apps, real-time systems and AI-powered products.",
    "Across three internships I've shipped React Native apps to the Play Store and App Store, built WebSocket chat servers and short-video feeds, and wired LLMs into real user workflows. Outside work I build DeFi infrastructure, ML pipelines and hackathon projects.",
  ],
  currentQuest: "Final year, 2027 grad · open to SDE and AI/ML roles",
  stats: [
    { label: "Mobile", value: 94 },
    { label: "AI / ML", value: 86 },
    { label: "Backend", value: 89 },
    { label: "Sleep debt", value: 100 },
  ],
};

export type Form = { kanji: string; ordinal: string; name: string; summary: string; skills: string[] };

export const forms: Form[] = [
  { kanji: "壱", ordinal: "First Form", name: "Frontend & Mobile", summary: "Interfaces that feel instant, on every screen.", skills: ["React Native", "Expo", "React.js", "TypeScript", "Redux", "Tailwind CSS", "Flutter / Dart"] },
  { kanji: "弐", ordinal: "Second Form", name: "Backend & Real-time", summary: "APIs and sockets that never flinch.", skills: ["Node.js", "Express.js", "FastAPI", "Flask", "Socket.IO / WebSockets", "REST APIs", "Go"] },
  { kanji: "参", ordinal: "Third Form", name: "AI / ML", summary: "Models and LLMs wired into real products.", skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "LangChain / LangGraph", "RAG & embeddings", "Gemini API"] },
  { kanji: "肆", ordinal: "Fourth Form", name: "Data & Cloud", summary: "Deploy, scale, sleep well.", skills: ["PostgreSQL", "MongoDB", "Firebase", "AWS", "Docker", "GitHub Actions CI/CD"] },
  { kanji: "伍", ordinal: "Fifth Form", name: "Web3 & Systems", summary: "On-chain infra and self-healing services.", skills: ["Algorand", "PuyaTS smart contracts", "AMM / DeFi", "Go concurrency", "C++ / DSA"] },
];

export type Mission = {
  rank: "S" | "A" | "B";
  title: string;
  summary: string;
  outcome: string;
  stack: string[];
  links: { label: string; href: string }[];
};

export const missions: Mission[] = [
  {
    rank: "S",
    title: "Slytherin DEX",
    summary: "API-first decentralized exchange on Algorand: an AMM with no retail UI, built so any fintech app or wallet can offer token swaps through a REST call.",
    outcome: "Constant-product pools, LP tokens, slippage protection · ~3.5s finality",
    stack: ["Algorand", "PuyaTS", "TypeScript SDK", "WebSockets"],
    links: [{ label: "Code", href: `${GH}/slytherin` }],
  },
  {
    rank: "S",
    title: "Genesis",
    summary: "Smart India Hackathon project: an AI pipeline that classifies deep-sea eDNA sequences and flags possible new species.",
    outcome: "Hybrid CNN + Transformer classifier · HDBSCAN novelty discovery",
    stack: ["Python", "TensorFlow", "Transformers", "React.js"],
    links: [{ label: "Code", href: `${GH}/Genesis` }],
  },
  {
    rank: "S",
    title: "FinTrace",
    summary: "Graph-based financial crime detection that spots money-muling networks and suspicious patterns in transaction data.",
    outcome: "Graph analysis of transaction networks · live demo",
    stack: ["Python", "Node.js", "React"],
    links: [
      { label: "Live", href: "https://fintrace-eight.vercel.app" },
      { label: "Code", href: `${GH}/Rift` },
    ],
  },
  {
    rank: "A",
    title: "Detoxify",
    summary: "Google Solution Challenge app for addiction recovery, with Gemini-generated recovery plans, streaks, mood tracking and community support.",
    outcome: "5+ AI workflows · 6+ tracking features",
    stack: ["Flutter", "Gemini API", "Firebase", "Node.js"],
    links: [{ label: "Code", href: `${GH}/detoxify` }],
  },
  {
    rank: "A",
    title: "AI 2D Video Generator",
    summary: "Turns a prompt into an animated 2D explainer video: Gemini writes the scene code, Manim renders it, and a job queue handles the work.",
    outcome: "Prompt → rendered video pipeline with queued jobs",
    stack: ["Gemini", "Manim", "Node.js", "Redis / BullMQ", "React"],
    links: [{ label: "Code", href: `${GH}/2DVideoGenerator` }],
  },
  {
    rank: "A",
    title: "Scribble",
    summary: "Real-time multiplayer drawing and guessing game for mobile with rooms, turns, scoring and a synced live canvas.",
    outcome: "Low-latency canvas sync across devices",
    stack: ["React Native", "Socket.IO", "Express.js"],
    links: [{ label: "Code", href: `${GH}/Scribble-Mobile-App` }],
  },
  {
    rank: "A",
    title: "Self-Healing Service",
    summary: "A Go worker pool that catches crashes, restarts its own workers and retries failed tasks, with a live health dashboard.",
    outcome: "Panic recovery · supervisor restarts · exponential backoff",
    stack: ["Go", "Goroutines", "HTTP"],
    links: [{ label: "Code", href: `${GH}/self-healing-service` }],
  },
  {
    rank: "B",
    title: "Document Intake Assistant",
    summary: "A conversational assistant that interviews users to fill a structured document. The LLM proposes updates; deterministic code validates and decides.",
    outcome: "LLM extraction + rule-based validation",
    stack: ["Python", "LLMs"],
    links: [{ label: "Code", href: `${GH}/Document-Intake-Assistant` }],
  },
];

export type Milestone = { period: string; title: string; place: string; note: string };

export const path: Milestone[] = [
  {
    period: "Nov 2025 — Mar 2026",
    title: "Software Engineering Intern",
    place: "GoLaddu Food Products",
    note: "Built a full social media app in React Native and a WebSocket chat server with presence, ran CI/CD to the Play Store and App Store, and cut app load time by optimizing fetching, caching and rendering.",
  },
  {
    period: "Aug 2025 — Jun 2026",
    title: "Web Team Lead",
    place: "IEEE & ACM, I2IT",
    note: "Built and deployed a live IEEE conference website, ran the ACM site with a team of five, and mentored students at hackathons.",
  },
  {
    period: "Jun 2025 — Oct 2025",
    title: "Mobile App Developer Intern",
    place: "Strmly Technologies",
    note: "Built 15+ reusable React Native components for a short-video platform, a custom autoplay video player with infinite feed, and end-to-end video upload with compression and progress.",
  },
  {
    period: "May 2025 — Jun 2025",
    title: "Mobile App Developer Intern",
    place: "Dhankuber Fintech",
    note: "Built the financial planner dashboard, onboarding and profile screens in React Native + Expo, with Firebase OTP phone login.",
  },
  {
    period: "2023 — 2027",
    title: "B.E. Information Technology",
    place: "I2IT, Pune",
    note: "CGPA 8.54. Where the training arc started.",
  },
