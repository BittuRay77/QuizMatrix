const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const AIInterviewSession = require('../models/AIInterviewSession');
const requireAuth = require('../utils/requireAuth');

const router = express.Router();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const roleLabelMap = {
  'software-engineer': 'Software Engineer',
  'backend-developer': 'Backend Developer',
  'cybersecurity': 'Security Analyst',
  'ml-engineer': 'ML Engineer',
  'data-scientist': 'Data Scientist',
  'ai-researcher': 'AI Researcher',
  'embedded-engineer': 'Embedded Engineer',
  'vlsi-design': 'VLSI Designer',
  'network-engineer': 'Network Engineer',
  'product-manager': 'Product Manager',
  'ui-ux-designer': 'UI/UX Designer',
};

const difficultyWeights = {
  easy: 0.85,
  medium: 1,
  hard: 1.2,
};

const roleProfiles = {
  'software-engineer': {
    core: ['data structures', 'APIs', 'system design', 'debugging'],
    strengths: ['problem solving', 'clean code', 'scalability'],
    improvements: ['tradeoff analysis', 'testing depth', 'observability'],
  },
  'backend-developer': {
    core: ['REST APIs', 'databases', 'auth', 'performance'],
    strengths: ['service design', 'data modeling', 'security'],
    improvements: ['caching', 'fault tolerance', 'load handling'],
  },
  'cybersecurity': {
    core: ['threat modeling', 'OWASP', 'incident response', 'identity'],
    strengths: ['risk awareness', 'policy thinking', 'attack analysis'],
    improvements: ['defense depth', 'tooling', 'automation'],
  },
  'ml-engineer': {
    core: ['model selection', 'feature engineering', 'deployment', 'evaluation'],
    strengths: ['experiment design', 'metrics', 'pipelines'],
    improvements: ['bias handling', 'monitoring', 'scaling'],
  },
  'data-scientist': {
    core: ['statistics', 'experimentation', 'business impact', 'visualization'],
    strengths: ['insights', 'analysis', 'communication'],
    improvements: ['causal reasoning', 'storytelling', 'deployment'],
  },
  'ai-researcher': {
    core: ['research methods', 'papers', 'model design', 'evaluation'],
    strengths: ['theory', 'depth', 'novelty'],
    improvements: ['productionization', 'benchmarking', 'replication'],
  },
  'embedded-engineer': {
    core: ['firmware', 'real-time systems', 'hardware interfaces', 'debugging'],
    strengths: ['low-level thinking', 'precision', 'reliability'],
    improvements: ['resource constraints', 'test automation', 'integration'],
  },
  'vlsi-design': {
    core: ['digital design', 'timing', 'verification', 'physical design'],
    strengths: ['hardware fundamentals', 'structured thinking', 'precision'],
    improvements: ['verification coverage', 'timing closure', 'EDA flow depth'],
  },
  'network-engineer': {
    core: ['routing', 'switching', 'security', 'troubleshooting'],
    strengths: ['topology understanding', 'diagnosis', 'resilience'],
    improvements: ['automation', 'cloud networking', 'documentation'],
  },
  'product-manager': {
    core: ['roadmaps', 'metrics', 'prioritization', 'stakeholders'],
    strengths: ['customer focus', 'decision making', 'strategy'],
    improvements: ['technical depth', 'measurement design', 'execution cadence'],
  },
  'ui-ux-designer': {
    core: ['research', 'interaction design', 'systems', 'accessibility'],
    strengths: ['empathy', 'visual hierarchy', 'prototyping'],
    improvements: ['handoff clarity', 'design rationale', 'metrics'],
  },
};

const technicalQuestionSets = {
  'software-engineer': [
    { prompt: 'Walk me through a system you built end-to-end and the tradeoffs you made.', guidance: 'Focus on architecture, scale, and your role in delivery.' },
    { prompt: 'How would you debug a production issue where latency suddenly doubles?', guidance: 'Explain your investigation sequence and tooling.' },
    { prompt: 'Describe a data structure or algorithm you use often and why it fits the problem.', guidance: 'Show conceptual clarity and practical judgment.' },
  ],
  'backend-developer': [
    { prompt: 'How do you design a REST API that is easy to version and maintain?', guidance: 'Cover resource design, validation, and backward compatibility.' },
    { prompt: 'What steps do you take to protect an authenticated endpoint from abuse?', guidance: 'Discuss auth, rate limiting, and monitoring.' },
    { prompt: 'How would you tune a slow database-backed endpoint?', guidance: 'Talk about indexes, query shape, caching, and profiling.' },
  ],
  'cybersecurity': [
    { prompt: 'How would you assess the risk of a newly discovered OWASP vulnerability?', guidance: 'Mention impact, exploitability, and mitigation.' },
    { prompt: 'What does a good incident response workflow look like?', guidance: 'Show containment, eradication, recovery, and lessons learned.' },
    { prompt: 'How do you balance usability and security in a product?', guidance: 'Explain practical controls that do not block users unnecessarily.' },
  ],
  'ml-engineer': [
    { prompt: 'How do you decide whether to improve data quality or the model architecture first?', guidance: 'Demonstrate prioritization based on signal and cost.' },
    { prompt: 'What metrics would you monitor after deploying an ML model?', guidance: 'Cover performance, drift, latency, and business outcomes.' },
    { prompt: 'How do you handle a model that looks good offline but fails in production?', guidance: 'Discuss leakage, distribution shift, and feedback loops.' },
  ],
  'data-scientist': [
    { prompt: 'How would you design an experiment to test whether a new feature improves retention?', guidance: 'Mention hypothesis, sample size, and success criteria.' },
    { prompt: 'How do you explain a non-intuitive analysis result to a business stakeholder?', guidance: 'Focus on clarity and decision support.' },
    { prompt: 'What do you do when the available data is noisy or incomplete?', guidance: 'Discuss cleaning, assumptions, and uncertainty.' },
  ],
  'ai-researcher': [
    { prompt: 'How do you evaluate whether a research idea is worth pursuing?', guidance: 'Talk about novelty, feasibility, and expected contribution.' },
    { prompt: 'What makes a paper result reproducible and credible?', guidance: 'Cover datasets, seeds, baselines, and ablations.' },
    { prompt: 'How do you move from a research prototype to a product-worthy system?', guidance: 'Explain validation, simplification, and deployment constraints.' },
  ],
  'embedded-engineer': [
    { prompt: 'How do you debug timing issues in an embedded system?', guidance: 'Discuss hardware signals, firmware logs, and state isolation.' },
    { prompt: 'What makes real-time software different from general application software?', guidance: 'Mention deadlines, determinism, and resource limits.' },
    { prompt: 'How do you verify that firmware changes are safe before release?', guidance: 'Cover test coverage, integration, and rollback planning.' },
  ],
  'vlsi-design': [
    { prompt: 'How do you approach timing closure in a digital design flow?', guidance: 'Explain synthesis, constraints, and verification.' },
    { prompt: 'What is the role of verification in reducing silicon risk?', guidance: 'Talk about coverage, assertions, and simulation strategy.' },
    { prompt: 'How do you think about power, area, and performance tradeoffs?', guidance: 'Show that you understand competing hardware objectives.' },
  ],
  'network-engineer': [
    { prompt: 'How would you isolate a network outage affecting only one application?', guidance: 'Show layered troubleshooting from DNS to routing to firewall rules.' },
    { prompt: 'How do you design a network to be resilient to single-point failures?', guidance: 'Discuss redundancy, failover, and monitoring.' },
    { prompt: 'What security controls matter most in enterprise network design?', guidance: 'Cover segmentation, access control, and visibility.' },
  ],
  'product-manager': [
    { prompt: 'How do you decide what to build next when there are many competing requests?', guidance: 'Talk about impact, effort, strategy, and stakeholders.' },
    { prompt: 'How do you measure whether a product change actually worked?', guidance: 'Explain leading and lagging indicators.' },
    { prompt: 'Tell me about a time you influenced a team without formal authority.', guidance: 'Show communication, alignment, and ownership.' },
  ],
  'ui-ux-designer': [
    { prompt: 'How do you validate a design before handing it to engineering?', guidance: 'Discuss prototypes, user feedback, and edge cases.' },
    { prompt: 'What is your process for balancing aesthetics with accessibility?', guidance: 'Explain color, hierarchy, and inclusive design.' },
    { prompt: 'How do you know a design system is actually helping a product team?', guidance: 'Talk about consistency, speed, and quality.' },
  ],
};

const hrQuestionSets = {
  default: [
    { prompt: 'Tell me about yourself and what kind of work energizes you most.', guidance: 'Be concise but make your motivation clear.' },
    { prompt: 'Why are you interested in this role and company?', guidance: 'Connect your background to the opportunity.' },
    { prompt: 'Describe a time you worked through conflict in a team.', guidance: 'Show maturity, ownership, and communication.' },
  ],
};

const piQuestionSets = {
  default: [
    { prompt: 'What is a professional weakness you have actively worked to improve?', guidance: 'Be honest and show evidence of growth.' },
    { prompt: 'Where do you see your career in the next three years?', guidance: 'Keep the answer realistic and aligned with the role.' },
    { prompt: 'How do you respond when your work is criticized?', guidance: 'Show openness and a learning mindset.' },
  ],
};

const resumeFollowUps = [
  { prompt: 'Which project on your resume best represents your current strengths?', guidance: 'Use one clear example and explain your contribution.' },
  { prompt: 'What is one skill from your resume you want to deepen in this role?', guidance: 'Show awareness of growth areas.' },
];

const clampScore = (value) => Math.max(0, Math.min(10, Math.round(value)));

const pick = (list, index, offset = 0) => list[(index + offset) % list.length];

const makeQuestionId = () => crypto.randomUUID();

const normalizeText = (text) => String(text || '').trim();

const getRoleProfile = (jobRole) => {
  return roleProfiles[jobRole] || {
    core: ['problem solving', 'communication', 'execution'],
    strengths: ['clarity', 'adaptability', 'ownership'],
    improvements: ['depth', 'consistency', 'examples'],
  };
};

const getRoleLabel = (jobRole) => roleLabelMap[jobRole] || jobRole.split(/[-_\s]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const buildQuestions = (session) => {
  const profile = getRoleProfile(session.jobRole);
  const difficultyBoost = difficultyWeights[session.difficulty] || 1;

  const technicalPool = technicalQuestionSets[session.jobRole] || [
    { prompt: `Explain how you approach ${profile.core[0] || 'a hard technical problem'} from start to finish.`, guidance: 'Structure your answer around understanding, design, and validation.' },
    { prompt: `What would you do if a project needs better ${profile.core[1] || 'performance'} under tight deadlines?`, guidance: 'Show prioritization and tradeoff thinking.' },
    { prompt: `Describe a time you used a technical decision to improve reliability or quality.`, guidance: 'Mention measurable impact.' },
  ];

  const basePool = session.interviewType === 'hr' ? hrQuestionSets.default : session.interviewType === 'pi' ? piQuestionSets.default : technicalPool;
  const questionCount = session.interviewMode === 'with-resume' ? 5 : 4;

  const questions = [];
  for (let index = 0; index < questionCount; index += 1) {
    const template = pick(basePool, index, index % basePool.length);
    const followUp = session.interviewMode === 'with-resume' && index < resumeFollowUps.length ? resumeFollowUps[index] : null;
    const prompt = followUp ? `${template.prompt} Also, ${followUp.prompt}` : template.prompt;
    const guidance = followUp ? `${template.guidance} ${followUp.guidance}` : template.guidance;

    questions.push({
      id: makeQuestionId(),
      type: session.interviewType === 'technical' ? 'technical' : session.interviewType,
      prompt,
      guidance,
      tags: [session.jobRole, session.difficulty, session.interviewMode, String(Math.round(10 * difficultyBoost))],
    });
  }

  if (session.interviewMode === 'with-resume' && session.resumeInsights) {
    questions[0].prompt = `${questions[0].prompt} Your resume suggests: ${session.resumeInsights}`;
  }

  return questions;
};

const summarizeAnswer = (answerText, question, session) => {
  const words = answerText.split(/\s+/).filter(Boolean).length;
  const hasExamples = /\b(for example|for instance|example|when I|I built|I led|I improved)\b/i.test(answerText);
  const hasStructure = /\b(first|second|finally|because|therefore|so that)\b/i.test(answerText);
  const hasTechnicalTerms = /\b(api|database|model|system|security|pipeline|debug|deploy|test|architecture|tradeoff)\b/i.test(answerText);
  const jobKeywords = getRoleProfile(session.jobRole).core;
  const matchesKeywords = jobKeywords.filter((keyword) => answerText.toLowerCase().includes(keyword.toLowerCase())).length;

  const communication = clampScore(3 + Math.min(4, words / 18) + (hasStructure ? 2 : 0) + (hasExamples ? 1.5 : 0));
  const relevance = clampScore(3 + matchesKeywords * 1.8 + (question.prompt.toLowerCase().includes(session.jobRole.replace(/[-_]/g, ' ')) ? 0.8 : 0));
  const technical = clampScore(2.5 + (hasTechnicalTerms ? 3.5 : 0) + Math.min(3, words / 28));
  const behavioral = clampScore(2.5 + (hasExamples ? 3 : 0) + (hasStructure ? 1.5 : 0));

  const feedback = [];
  if (communication >= 7) feedback.push('Your answer is well structured.');
  else feedback.push('Try to structure the response more clearly.');
  if (matchesKeywords > 0) feedback.push('You stayed relevant to the role.');
  else feedback.push('Connect the response more closely to the job requirements.');
  if (hasExamples) feedback.push('Good use of concrete examples.');
  else feedback.push('Add a concrete example to show impact.');

  return {
    short_feedback: feedback.join(' '),
    strengths: [
      ...(communication >= 7 ? ['Clear communication'] : []),
      ...(relevance >= 7 ? ['Role alignment'] : []),
      ...(behavioral >= 7 ? ['Professional maturity'] : []),
    ],
    improvements: [
      ...(communication < 7 ? ['Use a clearer answer structure'] : []),
      ...(relevance < 7 ? ['Tie your points back to the role'] : []),
      ...(technical < 7 ? ['Add more technical depth'] : []),
    ],
    communication_score: communication,
    relevance_score: relevance,
    technical_depth: technical,
    behavioral_fit: behavioral,
  };
};

const summarizeSession = (session) => ({
  id: String(session._id),
  jobRole: session.jobRole,
  difficulty: session.difficulty,
  interviewMode: session.interviewMode,
  interviewType: session.interviewType,
  resumeOriginalName: session.resumeOriginalName,
  status: session.status,
  createdAt: session.createdAt,
  completedAt: session.completedAt,
  finalAnalysis: session.finalAnalysis,
  answers: session.answers,
});

const sanitizeSession = (session) => ({
  id: String(session._id),
  jobRole: session.jobRole,
  difficulty: session.difficulty,
  interviewMode: session.interviewMode,
  interviewType: session.interviewType,
  resumeText: session.resumeText,
  resumeInsights: session.resumeInsights,
  resumeOriginalName: session.resumeOriginalName,
  questions: session.questions,
  answers: session.answers,
  finalAnalysis: session.finalAnalysis,
  status: session.status,
  currentQuestionIndex: session.currentQuestionIndex,
  createdAt: session.createdAt,
  completedAt: session.completedAt,
});

const buildFinalAnalysis = (session) => {
  const answers = session.answers || [];
  if (!answers.length) {
    return {
      confidence: 0,
      communication_score: 0,
      relevance_score: 0,
      technical_depth: 0,
      behavioral_fit: 0,
      strengths: ['Interview not started'],
      improvements: ['Answer at least one question before final analysis'],
      hr_email_response: 'Thank you for your time. We would like to continue the interview process after you complete the session.',
      summary: 'No answers were submitted.',
      recommendation: 'Restart and complete the interview to generate analytics.',
    };
  }

  const totals = answers.reduce((accumulator, answer) => {
    const analysis = answer.analysis || {};
    accumulator.communication += analysis.communication_score || 0;
    accumulator.relevance += analysis.relevance_score || 0;
    accumulator.technical += analysis.technical_depth || 0;
    accumulator.behavioral += analysis.behavioral_fit || 0;
    accumulator.wordCount += answer.answerText.split(/\s+/).filter(Boolean).length;
    accumulator.strengths.push(...(analysis.strengths || []));
    accumulator.improvements.push(...(analysis.improvements || []));
    return accumulator;
  }, {
    communication: 0,
    relevance: 0,
    technical: 0,
    behavioral: 0,
    wordCount: 0,
    strengths: [],
    improvements: [],
  });

  const answerCount = answers.length;
  const avg = (value) => clampScore(value / answerCount);

  const confidence = clampScore((avg(totals.communication) + avg(totals.relevance) + avg(totals.technical) + avg(totals.behavioral)) / 4 * 10 / 10 + Math.min(2, totals.wordCount / 120));
  const strengths = Array.from(new Set([
    ...(totals.communication / answerCount >= 7 ? ['Clear communication'] : []),
    ...(totals.relevance / answerCount >= 7 ? ['Role relevance'] : []),
    ...(totals.technical / answerCount >= 7 ? ['Technical depth'] : []),
    ...(totals.behavioral / answerCount >= 7 ? ['Behavioral maturity'] : []),
    ...totals.strengths,
  ])).slice(0, 5);
  const improvements = Array.from(new Set([
    ...(totals.communication / answerCount < 7 ? ['Structure answers with a clearer beginning, middle, and end'] : []),
    ...(totals.relevance / answerCount < 7 ? ['Tie examples more tightly to the role'] : []),
    ...(totals.technical / answerCount < 7 ? ['Add more technical evidence or specifics'] : []),
    ...totals.improvements,
  ])).slice(0, 5);

  const roleLabel = getRoleLabel(session.jobRole);
  const summary = `${roleLabel} interview completed with ${answerCount} answered questions. The candidate showed ${strengths[0] || 'balanced'} performance with room to improve ${improvements[0] || 'consistency'}.`;
  const recommendation = confidence >= 8 ? 'Strong candidate for the next round.' : confidence >= 6 ? 'Promising profile with a few areas to improve.' : 'Candidate should refine core answers before the next round.';

  return {
    confidence,
    communication_score: avg(totals.communication),
    relevance_score: avg(totals.relevance),
    technical_depth: avg(totals.technical),
    behavioral_fit: avg(totals.behavioral),
    strengths: strengths.length ? strengths : ['Committed participation'],
    improvements: improvements.length ? improvements : ['Keep building stronger examples'],
    hr_email_response: `Hello, thank you for completing the ${roleLabel} interview. Based on your responses, we have recorded your performance and will share the next steps soon.`,
    summary,
    recommendation,
  };
};

const createSilenceWav = (durationSeconds = 1) => {
  const sampleRate = 22050;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
};

const extractResumeText = async (file) => {
  if (!file) {
    return { resumeText: '', resumeInsights: 'No resume uploaded.' };
  }

  const filename = file.originalname || file.filename || 'resume';
  const extension = path.extname(filename).toLowerCase();

  try {
    if (extension === '.pdf') {
      const parsed = await pdfParse(file.buffer);
      return buildResumeSummary(parsed.text || '', filename);
    }

    if (extension === '.docx') {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return buildResumeSummary(parsed.value || '', filename);
    }

    if (extension === '.doc') {
      return buildResumeSummary(file.buffer.toString('utf8'), filename);
    }

    return buildResumeSummary(file.buffer.toString('utf8'), filename);
  } catch (error) {
    console.error('Resume parse error:', error);
    return {
      resumeText: `Unable to extract text from ${filename}.`,
      resumeInsights: 'Resume uploaded, but automated extraction was not possible.',
    };
  }
};

const buildResumeSummary = (rawText, fileName) => {
  const cleaned = normalizeText(rawText).replace(/\s+/g, ' ');
  const lower = cleaned.toLowerCase();
  const highlights = [];

  if (/react|frontend|html|css|javascript|typescript/.test(lower)) highlights.push('Frontend development');
  if (/node|express|api|mongodb|sql|database/.test(lower)) highlights.push('Backend and API work');
  if (/python|machine learning|data science|ml|deep learning/.test(lower)) highlights.push('Data science or ML');
  if (/docker|kubernetes|aws|azure|gcp|deployment/.test(lower)) highlights.push('Deployment and DevOps');
  if (/team|lead|collaborat|stakeholder|communication/.test(lower)) highlights.push('Collaboration and leadership');

  const summary = highlights.length
    ? `Resume parsed successfully. Likely strengths: ${highlights.join(', ')}.`
    : 'Resume parsed successfully. The profile looks balanced across general skills and experience.';

  return {
    resumeText: cleaned.slice(0, 8000),
    resumeInsights: summary,
    fileName,
  };
};

router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { jobRole, difficulty = 'medium', interviewMode = 'without-resume', interviewType = 'technical', resumeText = '', resumeInsights = '', resumeOriginalName = '' } = req.body;

    if (!jobRole) {
      return res.status(400).json({ message: 'Job role is required' });
    }

    const session = await AIInterviewSession.create({
      user: req.userId,
      jobRole: normalizeText(jobRole),
      difficulty,
      interviewMode,
      interviewType,
      resumeText: normalizeText(resumeText),
      resumeInsights: normalizeText(resumeInsights),
      resumeOriginalName: normalizeText(resumeOriginalName),
      status: 'draft',
    });

    return res.status(201).json({
      session: {
        id: String(session._id),
        jobRole: session.jobRole,
        difficulty: session.difficulty,
        interviewMode: session.interviewMode,
        interviewType: session.interviewType,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('Create AI interview session error:', error);
    return res.status(500).json({ message: 'Failed to start AI interview session.' });
  }
});

router.post('/generate-questions', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await AIInterviewSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.questions.length > 0) {
      return res.json({ questions: session.questions });
    }

    const questions = buildQuestions(session);
    session.questions = questions;
    session.status = 'in-progress';
    session.currentQuestionIndex = 0;
    await session.save();

    return res.json({ questions });
  } catch (error) {
    console.error('Generate AI interview questions error:', error);
    return res.status(500).json({ message: 'Failed to generate questions' });
  }
});

router.post('/analyze-answer', requireAuth, async (req, res) => {
  try {
    const { sessionId, questionIndex, questionType, questionText, answerText, transcript = '', timeSpentSeconds = 0 } = req.body;

    if (!sessionId || questionIndex === undefined || !questionText || !answerText) {
      return res.status(400).json({ message: 'Missing answer analysis fields' });
    }

    const session = await AIInterviewSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const question = session.questions[questionIndex] || { prompt: questionText, type: questionType || 'technical' };
    const analysis = summarizeAnswer(normalizeText(answerText), question, session);

    const nextAnswer = {
      questionIndex: Number(questionIndex),
      questionType: questionType || question.type || 'technical',
      questionText: normalizeText(questionText),
      answerText: normalizeText(answerText),
      transcript: normalizeText(transcript),
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      analysis,
    };

    const filtered = session.answers.filter((item) => item.questionIndex !== nextAnswer.questionIndex);
    filtered.push(nextAnswer);
    filtered.sort((left, right) => left.questionIndex - right.questionIndex);
    session.answers = filtered;
    session.currentQuestionIndex = Math.max(session.currentQuestionIndex, nextAnswer.questionIndex + 1);
    session.status = 'in-progress';

    await session.save();

    return res.json({ analysis });
  } catch (error) {
    console.error('Analyze AI interview answer error:', error);
    return res.status(500).json({ message: 'Failed to analyze answer.' });
  }
});

router.post('/final-analysis', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await AIInterviewSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.finalAnalysis = buildFinalAnalysis(session);
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    return res.json({ session: sanitizeSession(session) });
  } catch (error) {
    console.error('Final AI interview analysis error:', error);
    return res.status(500).json({ message: 'Failed to generate final analysis.' });
  }
});

router.post('/text-to-speech', requireAuth, async (req, res) => {
  try {
    const text = normalizeText(req.body.text);
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const words = text.split(/\s+/).filter(Boolean).length;
    const duration = Math.max(1, Math.min(6, Math.round(words / 2)));
    const wav = createSilenceWav(duration);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wav.length);
    res.setHeader('Content-Disposition', 'inline; filename="question.wav"');
    return res.send(wav);
  } catch (error) {
    console.error('Text to speech error:', error);
    return res.status(500).json({ message: 'Failed to synthesize audio' });
  }
});

router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = await AIInterviewSession.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ sessions: sessions.map(summarizeSession) });
  } catch (error) {
    console.error('Fetch AI interview sessions error:', error);
    return res.status(500).json({ message: 'Failed to fetch AI interview history.' });
  }
});

router.get('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const session = await AIInterviewSession.findOne({ _id: req.params.sessionId, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.json({ session: sanitizeSession(session) });
  } catch (error) {
    console.error('Fetch AI interview session error:', error);
    return res.status(500).json({ message: 'Failed to fetch AI interview session.' });
  }
});

router.post('/resume-scan', requireAuth, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const result = await extractResumeText(req.file);
    return res.json({
      resumeText: result.resumeText,
      resumeInsights: result.resumeInsights,
      fileName: result.fileName || req.file.originalname,
    });
  } catch (error) {
    console.error('Resume scan error:', error);
    return res.status(500).json({ message: 'Failed to scan resume' });
  }
});

module.exports = router;
