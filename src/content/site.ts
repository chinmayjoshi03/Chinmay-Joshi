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
