const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model priority list — only models your free-tier API key can actually access
// gemini-2.5-flash is the only one available on the free tier as of mid-2025
// Keep others commented so it's easy to add back when your key is upgraded
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  // 'gemini-2.0-flash',       // needs paid tier
  // 'gemini-2.0-flash-lite',  // needs paid tier
  // 'gemini-1.5-flash',       // needs paid tier
  // 'gemini-1.5-flash-8b',    // needs paid tier
];

/**
 * Robustly extract JSON from Gemini output.
 * Handles: raw JSON, ```json ... ```, ``` ... ```, prose + JSON, template-literal issues.
 */
function extractJSON(text) {
  if (!text) return null;

  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
  }

  // 2. Try bare JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch (_) {}
    // 3. Try fixing common issues: trailing commas, unquoted keys
    try {
      const cleaned = objMatch[0]
        .replace(/,\s*([}\]])/g, '$1')   // remove trailing commas
        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":'); // quote bare keys
      return JSON.parse(cleaned);
    } catch (_) {}
  }

  // 4. Try bare JSON array
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch (_) {}
  }

  return null;
}

const DEBATE_SYSTEM_PROMPT = `You are an expert AI debate coach and debate partner named "Aria".

Your core responsibilities:
1. Challenge weak reasoning with intelligent counter-arguments
2. Remain respectful and educational at all times
3. Encourage critical thinking and stronger reasoning
4. Explain logical fallacies when detected, clearly and concisely
5. Generate intelligent, well-structured counter-arguments
6. Adapt to the user's skill level (beginner to expert)
7. Maintain natural conversational debate flow
8. Provide constructive feedback after each exchange
9. REMEMBER previous arguments — call out contradictions and inconsistencies
10. Reference specific earlier claims the user made when relevant

Debate style guidelines:
- Be intellectually rigorous but never condescending
- Use evidence-based reasoning when possible
- Acknowledge strong points before countering
- Ask probing Socratic questions to deepen thinking
- Keep responses focused and debate-appropriate (2-4 paragraphs max)
- Use clear logical structure: claim, evidence, reasoning
- If the user contradicts a previous statement, point it out respectfully
- Track the user's main thesis and test its consistency throughout

If a logical fallacy is detected in the user's argument:
1. Briefly name and explain the fallacy
2. Show why it weakens their argument
3. Suggest how they could strengthen their position
4. Continue the debate naturally

Response format:
- Start with a direct engagement of their argument
- Provide your counter-position with reasoning
- End with a challenging question or point to keep debate flowing
- Keep tone: confident, intelligent, engaging`;

const FEEDBACK_SYSTEM_PROMPT = `You are an expert debate coach providing detailed educational feedback.
Analyze the debate argument and provide:
1. Logical strength assessment (0-100)
2. Persuasion effectiveness (0-100)
3. Evidence quality assessment
4. Specific improvement suggestions
5. What was done well
6. Key logical fallacies present (if any)
Be specific, actionable, and encouraging.`;

class GeminiService {
  constructor() {
    this.conversationHistory = new Map();
    this.currentModelIndex = 0;
  }

  // Get a model instance with fallback support
  _getModel(systemInstruction = null) {
    const modelName = FALLBACK_MODELS[this.currentModelIndex] || FALLBACK_MODELS[0];
    const config = {
      model: modelName,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    return genAI.getGenerativeModel(config);
  }

  // Try with fallback models on rate limit / overload / not-found
  async _generateWithFallback(generateFn) {
    let lastError;
    for (let i = 0; i < FALLBACK_MODELS.length; i++) {
      this.currentModelIndex = i;
      try {
        return await generateFn();
      } catch (error) {
        lastError = error;
        const msg = (error.message || '').toLowerCase();
        const status = error.status || error.statusCode || 0;

        const isNotFound   = status === 404 || msg.includes('404') || msg.includes('not found');
        const isRateLimit  = status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit');
        const isOverloaded = status === 503 || status === 500 || status === 529 ||
                             msg.includes('503') || msg.includes('overload') ||
                             msg.includes('high demand') || msg.includes('unavailable') ||
                             msg.includes('service unavailable');

        if (isNotFound) {
          if (i < FALLBACK_MODELS.length - 1) {
            console.log(`Model ${FALLBACK_MODELS[i]} not found (404), trying ${FALLBACK_MODELS[i + 1]}...`);
            continue; // no wait — model just doesn't exist
          }
        }

        if (isRateLimit) {
          // Parse retryDelay from Gemini error message e.g. "retry in 5.68s"
          const retryMatch = error.message && error.message.match(/retry[^:]*:\s*"?(\d+(?:\.\d+)?)/i);
          const waitMs = retryMatch
            ? Math.min(Math.ceil(parseFloat(retryMatch[1])) * 1000 + 500, 15000)
            : 6000;

          if (i < FALLBACK_MODELS.length - 1) {
            console.log(`Rate limit on ${FALLBACK_MODELS[i]}, waiting ${waitMs}ms then trying ${FALLBACK_MODELS[i + 1]}...`);
            await new Promise(r => setTimeout(r, waitMs));
            continue;
          }
          // Last model also rate-limited — wait and retry the same model once
          console.log(`All models rate-limited. Waiting ${waitMs}ms then retrying ${FALLBACK_MODELS[i]}...`);
          await new Promise(r => setTimeout(r, waitMs));
          try { return await generateFn(); } catch (e2) { lastError = e2; }
        }

        if (isOverloaded) {
          if (i < FALLBACK_MODELS.length - 1) {
            console.log(`Model ${FALLBACK_MODELS[i]} overloaded (${status}), trying ${FALLBACK_MODELS[i + 1]} in 1s...`);
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          // Only one model and it's overloaded — wait and retry once
          await new Promise(r => setTimeout(r, 3000));
          try { return await generateFn(); } catch (e2) { lastError = e2; }
        }

        // Non-retryable error — throw immediately
        throw error;
      }
    }
    throw lastError || new Error('All models exhausted');
  }

  // Generate debate response with argument memory
  async generateDebateResponse(debateId, userMessage, context = {}) {
    try {
      const { topic, difficulty, aiPersonality, conversationHistory = [], argumentMemory = null, debateMode = 'classic' } = context;

      const personalityModifiers = {
        socratic: 'Use the Socratic method exclusively — respond primarily with probing questions that expose assumptions and logical gaps. Rarely make direct statements; instead guide through questions like "What evidence supports that?" or "What assumption are you making here?"',
        aggressive: 'Be intellectually forceful — challenge every weak claim strongly but remain respectful. Push back hard on vague assertions. Demand specific evidence. Do not let weak arguments slide.',
        empathetic: 'Acknowledge the human dimension of arguments before challenging them. Show you understand their perspective genuinely, then respectfully but firmly challenge the logical gaps.',
        logical: 'Focus purely on logical structure, formal reasoning, evidence quality, and argument validity. Identify premises, evaluate inferences, check for consistency.',
        devil_advocate: 'Always argue the strongest possible opposing position, even if you personally agree with the user. Find the best steel-man counter-argument and present it forcefully.',
      };

      const difficultyModifiers = {
        beginner: 'Use simple, clear language. Be encouraging and supportive. Focus on one main point per response. Keep responses to 2-3 short paragraphs. Explain reasoning clearly.',
        intermediate: 'Use moderate complexity. Balance challenge with encouragement. Keep responses to 2-3 paragraphs.',
        advanced: 'Use sophisticated arguments. Challenge nuance and subtlety. Keep responses to 3-4 paragraphs. Push for evidence and logical precision.',
        expert: 'Use expert-level philosophical and logical discourse. Be intellectually demanding. Challenge every premise. Keep responses to 3-4 dense paragraphs.',
      };

      // Build argument memory context string (compact, not full history)
      let memoryContext = '';
      if (argumentMemory && (argumentMemory.userClaims?.length > 0 || argumentMemory.contradictions?.length > 0)) {
        const claims = (argumentMemory.userClaims || []).slice(-4).join('; ');
        const contradictions = (argumentMemory.contradictions || []).slice(-2).join('; ');
        memoryContext = `\nARGUMENT MEMORY (user's previous positions):
- Main claims made: ${claims || 'none yet'}
- Potential contradictions to watch: ${contradictions || 'none detected'}
If the current message contradicts a previous claim, point it out respectfully and ask for reconciliation.`;
      }

      // Mode-specific instructions
      let modeInstruction = '';
      if (debateMode === 'cross_examination') {
        modeInstruction = '\nMODE: Cross-Examination — Focus primarily on asking probing questions about the user\'s assumptions, evidence, and reasoning. Ask what would change their mind. Question every premise.';
      } else if (debateMode === 'rapid_fire') {
        modeInstruction = '\nMODE: Rapid Fire — Keep your response to ONE short paragraph maximum (3-4 sentences). Be direct and punchy. No lengthy explanations.';
      }

      const systemText = `${DEBATE_SYSTEM_PROMPT}

Topic: "${topic || 'General debate'}"
Difficulty: ${difficulty || 'intermediate'} — ${difficultyModifiers[difficulty] || difficultyModifiers.intermediate}
Personality: ${aiPersonality || 'logical'} — ${personalityModifiers[aiPersonality] || personalityModifiers.logical}
${memoryContext}${modeInstruction}
IMPORTANT: Keep your response SHORT (2-3 paragraphs max for classic mode), directly relevant to what the user just said, and always end with a challenging question or counter-point.`;

      // Build valid Gemini history — must alternate user/model, start with user
      const rawHistory = conversationHistory.filter(m => m.content && m.content.trim());
      const validHistory = [];
      
      // Gemini requires history to alternate user → model → user → model
      // Skip the first message if it's from AI (opening statement)
      let startIdx = 0;
      if (rawHistory.length > 0 && rawHistory[0].sender === 'ai') {
        startIdx = 1; // skip AI opening
      }
      
      for (let i = startIdx; i < rawHistory.length - 1; i += 2) {
        const userMsg = rawHistory[i];
        const aiMsg = rawHistory[i + 1];
        if (userMsg && aiMsg && userMsg.sender === 'user' && aiMsg.sender === 'ai') {
          validHistory.push({ role: 'user', parts: [{ text: userMsg.content }] });
          validHistory.push({ role: 'model', parts: [{ text: aiMsg.content }] });
        }
      }

      const responseText = await this._generateWithFallback(async () => {
        const model = this._getModel(systemText);
        const chat = model.startChat({ history: validHistory });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
      });

      return {
        success: true,
        content: responseText,
        model: FALLBACK_MODELS[this.currentModelIndex],
      };
    } catch (error) {
      console.error('Gemini debate response error:', error.message);
      const { topic, difficulty, aiPersonality } = context;
      const msg = userMessage.toLowerCase();
      const topicLower = (topic || '').toLowerCase();
      const level = difficulty || 'intermediate';

      // ── Local fallback debater — difficulty-aware ────────────
      // Beginner: simple, encouraging, short sentences, everyday language
      // Intermediate: moderate, balanced challenge
      // Advanced/Expert: rigorous, demand precision and evidence

      const personalityOpeners = {
        socratic: {
          beginner:     ['That\'s interesting — but why do you think that?', 'Can you give me one example that shows that?', 'What made you think of that point?'],
          intermediate: ['What specific evidence supports that claim?', 'Have you considered the assumptions underlying that argument?', 'What would you say to someone who challenged that premise?'],
          advanced:     ['What epistemological basis supports that inference?', 'Have you considered the second-order effects of that claim?', 'What hidden assumptions are embedded in that framing?'],
          expert:       ['That claim presupposes a contested normative framework — can you defend it?', 'What would falsify that proposition?', 'Which philosophical tradition grounds your reasoning here?'],
        },
        aggressive: {
          beginner:     ['Hmm, that\'s not quite right though.', 'I think you\'re missing something important here.', 'That point needs more support.'],
          intermediate: ['That argument doesn\'t hold up under scrutiny.', 'You\'re ignoring a critical part of this issue.', 'That position falls apart quickly when you look closely.'],
          advanced:     ['That argument is fundamentally flawed.', 'You\'re ignoring a critical dimension of this issue.', 'That\'s an interesting position, but it collapses immediately.'],
          expert:       ['That reasoning is logically incoherent.', 'You\'ve committed a category error.', 'That claim is empirically and philosophically untenable.'],
        },
        empathetic: {
          beginner:     ['I can see why you feel that way — but let\'s think about it together.', 'That\'s a fair point! Let me share a different side though.', 'I get what you mean — here\'s something else to consider.'],
          intermediate: ['I understand where you\'re coming from, and I respect that perspective.', 'That\'s a genuinely important concern worth taking seriously.', 'I appreciate you sharing that — let me engage with it carefully.'],
          advanced:     ['That perspective has real merit — here\'s where I\'d push back thoughtfully.', 'I understand the intuition behind that claim, but it has limits.', 'That\'s a well-intentioned argument that deserves careful scrutiny.'],
          expert:       ['I appreciate the nuance in that position — but here\'s where it breaks down.', 'That\'s a sophisticated argument that still has a critical vulnerability.'],
        },
        logical: {
          beginner:     ['Let\'s think through that step by step.', 'That\'s a good start — but there\'s a gap in the reasoning.', 'OK so if that\'s true, what does it actually mean?'],
          intermediate: ['Let\'s examine the logical structure of that claim.', 'That argument has a gap in its reasoning.', 'There\'s an important distinction being overlooked here.'],
          advanced:     ['The logical structure of that claim has a critical flaw.', 'That argument conflates two distinct issues.', 'The inferential gap between premise and conclusion is problematic.'],
          expert:       ['That argument is either question-begging or relies on an unstated premise.', 'The logical form of that argument is invalid.', 'That reasoning pattern commits a formal fallacy.'],
        },
        devil_advocate: {
          beginner:     ['Actually, let me argue the opposite — just to make things interesting!', 'What if the other side is right though?', 'Let me play devil\'s advocate here.'],
          intermediate: ['Let me push back on that position.', 'The strongest counter-argument to your view is actually this:', 'Playing devil\'s advocate, one could argue the exact opposite:'],
          advanced:     ['The strongest steel-man against your position would be:', 'Devil\'s advocate: the opposing view has a compelling case here.', 'Let me construct the most powerful objection to your claim:'],
          expert:       ['The most rigorous counter-position would contend:', 'Contra your thesis, the strongest opposing argument holds that:', 'The dialectical antithesis of your position would argue:'],
        },
      };

      const personality = aiPersonality || 'logical';
      const openerSet = (personalityOpeners[personality] || personalityOpeners.logical)[level] || personalityOpeners.logical.intermediate;
      const opener = openerSet[Math.floor(Math.random() * openerSet.length)];

      // ── Difficulty-scaled counter-arguments ──────────────────
      let counter = '';
      let question = '';

      if (level === 'beginner') {
        // Simple, short, encouraging, everyday language
        if (msg.includes('children') || msg.includes('kids') || msg.includes('student') || msg.includes('school') || msg.includes('phone') || msg.includes('mobile')) {
          counter = 'That\'s a fair point. But some people would say phones also help students learn — like looking things up, using educational apps, or staying safe by calling their parents. So it\'s not all bad.';
          question = 'Do you think there\'s a way to let students use phones for good things while stopping the bad things?';
        } else if (msg.includes('good') || msg.includes('benefit') || msg.includes('help') || msg.includes('support') || msg.includes('agree')) {
          counter = 'OK, I can see the benefits. But what about people who think the opposite? They might say it causes problems too. Both sides have a point.';
          question = 'What\'s one thing that could go wrong with your idea?';
        } else if (msg.includes('bad') || msg.includes('harm') || msg.includes('problem') || msg.includes('disadvantage')) {
          counter = 'Those are real problems. But sometimes things that seem bad can also have good sides. Can you think of any good things about it too?';
          question = 'Is there any situation where it might actually be OK?';
        } else {
          const begCounters = [
            'That\'s an interesting idea! But what about people who think differently? They might have a good reason too.',
            'Good point — but every coin has two sides. What might someone on the other side say?',
            'I see what you mean. But can you give me a real example that shows this is true?',
          ];
          counter = begCounters[Math.floor(Math.random() * begCounters.length)];
          question = 'Can you explain that a bit more simply?';
        }

      } else if (level === 'intermediate') {
        if (msg.includes('children') || msg.includes('kids') || msg.includes('age') || msg.includes('student') || msg.includes('phone') || msg.includes('mobile')) {
          counter = `That's a valid concern. However, banning or restricting ${topicLower || 'this'} entirely may not be the best solution. The question is whether we can create frameworks — like clear usage policies or digital literacy programmes — that allow the benefits while minimising the harms.`;
          question = 'Would regulated access work better than an outright ban? What would that look like?';
        } else if (msg.includes('evidence') || msg.includes('study') || msg.includes('research') || msg.includes('prove')) {
          counter = 'Citing evidence is a strong instinct — but "studies show" without specifics is an appeal to authority. The same topic often has studies pointing in both directions, depending on sample size, context, and methodology.';
          question = 'Do you know of a specific study on this? What did it actually find?';
        } else if (msg.includes('disadvantage') || msg.includes('harm') || msg.includes('bad') || msg.includes('negative')) {
          counter = `The harms around ${topicLower || 'this'} are real, but we need to weigh them against the benefits. The question is: compared to what alternative? Things don't disappear just because we ban or restrict them — they may just change form.`;
          question = 'What\'s your proposed alternative, and does it solve the problem better?';
        } else if (msg.includes('advantage') || msg.includes('benefit') || msg.includes('good') || msg.includes('agree') || msg.includes('support')) {
          counter = `The benefits you\'re describing are real. But who benefits most, and who might be left out or harmed? The impact of ${topicLower || 'this'} isn't the same for everyone.`;
          question = 'Are the benefits spread equally, or do some groups gain more than others?';
        } else {
          const intCounters = [
            `Your point about ${topicLower || 'this'} makes sense on the surface. But let's stress-test it — what's the strongest argument someone on the other side would make?`,
            'That\'s a reasonable position. But it assumes things are straightforward, when in practice they rarely are. What complications might arise?',
            'Good argument. Now — what\'s the most likely objection to it, and how would you respond?',
          ];
          counter = intCounters[Math.floor(Math.random() * intCounters.length)];
          question = 'What would change your mind on this?';
        }

      } else {
        // Advanced / Expert
        if (msg.includes('children') || msg.includes('kids') || msg.includes('age')) {
          counter = 'The concern about age-appropriateness is valid, but it shifts the locus of responsibility. The real question is whether we address this through regulation, platform design, parental oversight, or digital literacy education — and which mechanism has the strongest evidence base for actually working.';
          question = 'What specific mechanism would you propose, and what evidence supports its effectiveness over alternatives?';
        } else if (msg.includes('evidence') || msg.includes('study') || msg.includes('research') || msg.includes('prove')) {
          counter = 'Citing evidence is essential — but we need to be precise about what the evidence actually shows. Correlation between two phenomena doesn\'t establish causation. Many studies in this area have methodological limitations — small samples, short timeframes, confounding variables — that prevent strong causal claims.';
          question = 'Can you identify a specific study, describe its methodology, what it controlled for, and what its actual conclusion stated?';
        } else if (msg.includes('disadvantage') || msg.includes('harm') || msg.includes('bad') || msg.includes('negative')) {
          counter = `The harms you\'re identifying around ${topicLower} are real, but they have to be weighed against countervailing benefits. A rigorous analysis asks: compared to what alternative? The absence of this technology or policy doesn\'t mean the problems disappear — it may mean they manifest differently or fall on different groups.`;
          question = 'What is your proposed alternative, and how do you know it wouldn\'t produce equal or greater harms?';
        } else if (msg.includes('advantage') || msg.includes('benefit') || msg.includes('good') || msg.includes('positive') || msg.includes('agree') || msg.includes('support')) {
          counter = `The benefits you\'re describing are real, but they tend to be distributed unevenly. The people who gain most from ${topicLower || 'this'} are often not the same people who bear its costs. That distributional question is central to any serious ethical or policy evaluation.`;
          question = 'Who specifically benefits most, and who bears the greatest costs? Is that distribution justifiable?';
        } else if (msg.includes('government') || msg.includes('law') || msg.includes('regulation') || msg.includes('policy') || msg.includes('ban')) {
          counter = 'Regulatory solutions sound appealing but face serious implementation challenges. Regulations can be captured by the industries they\'re meant to constrain, they struggle to keep pace with rapidly evolving technology, and they often have unintended consequences that create new problems.';
          question = 'What specific regulatory mechanism are you proposing, and what historical precedent gives you confidence it would work as intended?';
        } else if (msg.includes('everyone') || msg.includes('all people') || msg.includes('always') || msg.includes('never')) {
          counter = 'Absolute claims like "everyone", "always", or "never" are rarely defensible in complex social debates. One well-documented counter-example invalidates an absolute claim. You may have a strong probabilistic argument here — but the absolute framing weakens it considerably.';
          question = 'Can you restate your position in probabilistic terms and show that it still holds?';
        } else {
          const advCounters = [
            `Your argument about ${topicLower || 'this topic'} rests on several implicit assumptions. You\'re assuming the current state of affairs is the right baseline for comparison, and that the effects you\'re describing are the primary ones. Both assumptions are contestable.`,
            `The strongest version of the opposing view would say: the very framing of this debate privileges certain values over others. Before we evaluate the evidence, we need to agree on what we\'re optimising for.`,
            `What you\'ve described is a genuine concern. But the question isn\'t whether this issue exists — it\'s whether your proposed response is proportionate, effective, and doesn\'t create worse problems than it solves.`,
          ];
          counter = advCounters[Math.floor(Math.random() * advCounters.length)];
          question = 'What would constitute sufficient evidence to change your position?';
        }
      }

      const fallbackContent = `${opener}\n\n${counter}\n\n${question}`;

      return {
        success: false,
        content: fallbackContent,
        error: error.message,
      };
    }
  }

  // Generate comprehensive debate summary and analysis
  async generateDebateSummary(topic, messages) {
    try {
      const conversationText = messages
        .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n\n');

      const prompt = `Analyze this debate on "${topic}" and provide a comprehensive performance report.

${conversationText}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "2-3 sentence overview of the debate",
  "winner": "user|ai|draw",
  "winnerReason": "brief explanation of why",
  "logicScore": 65,
  "persuasionScore": 60,
  "evidenceScore": 55,
  "rebuttalScore": 70,
  "clarityScore": 72,
  "consistencyScore": 68,
  "overallScore": 65,
  "xpEarned": 75,
  "strongestArgument": "The user's strongest argument was...",
  "weakestArgument": "The weakest argument was...",
  "mostCommonFallacy": "name of most frequent fallacy or null",
  "fallacyCount": 2,
  "bestRebuttal": "The most effective rebuttal was...",
  "missedOpportunities": ["opportunity 1", "opportunity 2"],
  "userStrengths": ["strength1", "strength2"],
  "userWeaknesses": ["weakness1", "weakness2"],
  "keyInsights": ["insight1", "insight2"],
  "improvementAreas": ["area1", "area2"],
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "nextChallenge": "Suggested next debate topic or skill to practice"
}`;

      const text = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      });

      const parsed = extractJSON(text);
      if (parsed) return { success: true, data: parsed };

      return {
        success: true,
        data: {
          summary: 'A thoughtful debate with good arguments on both sides.',
          winner: 'draw', logicScore: 65, persuasionScore: 60, evidenceScore: 55,
          rebuttalScore: 65, clarityScore: 70, consistencyScore: 68, overallScore: 62,
          xpEarned: 75, fallacyCount: 0, mostCommonFallacy: null,
          strongestArgument: 'You presented clear initial claims.',
          weakestArgument: 'Some arguments lacked supporting evidence.',
          bestRebuttal: 'You challenged the opposing position directly.',
          missedOpportunities: ['Could have pressed for more evidence'],
          keyInsights: ['Good engagement with the topic', 'Room to strengthen evidence'],
          improvementAreas: ['Use more specific examples'],
          userStrengths: ['Clear position stated'], userWeaknesses: ['Could use more evidence'],
          recommendations: ['Practice citing specific evidence'],
          nextChallenge: 'Try a debate on a related topic with more evidence focus',
        }
      };
    } catch (error) {
      console.error('Gemini summary error:', error.message);
      return {
        success: false,
        data: {
          summary: 'Debate completed successfully.',
          winner: 'draw', logicScore: 65, persuasionScore: 60, evidenceScore: 55,
          rebuttalScore: 65, clarityScore: 70, consistencyScore: 68, overallScore: 62,
          xpEarned: 50, fallacyCount: 0, mostCommonFallacy: null,
          strongestArgument: '', weakestArgument: '', bestRebuttal: '',
          missedOpportunities: [], keyInsights: [], improvementAreas: [],
          userStrengths: [], userWeaknesses: [], recommendations: [],
          nextChallenge: 'Continue practising your debate skills',
        }
      };
    }
  }

  // Score argument strength (lightweight — used for real-time feedback)
  async scoreArgument(argument, topic, previousFallacies = []) {
    try {
      const fallacyNote = previousFallacies.length > 0
        ? `Previously detected fallacies in this session: ${previousFallacies.join(', ')}.`
        : '';

      const prompt = `Score this debate argument on the topic "${topic}":
"${argument}"
${fallacyNote}

Respond with ONLY valid JSON:
{"logic":70,"relevance":80,"evidence":50,"persuasion":65,"consistency":75,"clarity":72,"overall":69,"feedback":"One sentence on the strongest and weakest aspect.","improvedVersion":"A stronger version would be..."}

Scores are 0-100. Be accurate and fair.`;

      const text = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      });

      const parsed = extractJSON(text);
      if (parsed) return { success: true, data: parsed };

      // Local fallback scoring based on argument length + basic heuristics
      const wordCount = argument.split(' ').length;
      const baseScore = Math.min(85, 40 + wordCount * 2);
      return {
        success: true,
        data: {
          logic: baseScore, relevance: baseScore + 5, evidence: Math.max(30, baseScore - 15),
          persuasion: baseScore - 5, consistency: baseScore + 8, clarity: baseScore + 3,
          overall: baseScore,
          feedback: 'Argument processed. Add specific evidence to strengthen it.',
          improvedVersion: argument,
        }
      };
    } catch (error) {
      console.error('Gemini score argument error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Generate a debate topic with positions and arguments
  async generateDebateTopic(category, difficulty) {
    try {
      const prompt = `Generate a thought-provoking debate topic for the category "${category}" at "${difficulty}" difficulty level.

Respond with ONLY valid JSON (no markdown):
{
  "topic": "The debate topic statement",
  "proPosition": "One sentence supporting the topic",
  "conPosition": "One sentence opposing the topic",
  "proArguments": ["key pro argument 1", "key pro argument 2", "key pro argument 3"],
  "conArguments": ["key con argument 1", "key con argument 2", "key con argument 3"],
  "difficultyExplanation": "Why this is ${difficulty} difficulty",
  "suggestedEvidence": ["evidence type 1", "evidence type 2"]
}

Requirements:
- Topic must be genuinely debatable (not one-sided)
- Appropriate for academic/educational debate
- Avoid inappropriate, violent, or discriminatory topics
- Difficulty ${difficulty}: ${difficulty === 'beginner' ? 'simple and familiar concepts' : difficulty === 'intermediate' ? 'requires some background knowledge' : difficulty === 'advanced' ? 'complex multi-faceted issue' : 'expert-level nuanced arguments needed'}`;

      const text = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      });

      const parsed = extractJSON(text);
      if (parsed) return { success: true, data: parsed };

      return { success: false, error: 'Failed to parse topic data' };
    } catch (error) {
      console.error('Gemini topic generation error:', error.message);
      // Static fallback topics by category
      const fallbacks = {
        technology:   { topic: 'Artificial intelligence will create more jobs than it destroys', proPosition: 'AI automates repetitive tasks, freeing humans for creative and strategic roles', conPosition: 'AI displacement will outpace job creation, leaving millions unemployed' },
        science:      { topic: 'Gene editing technology should be used to eliminate hereditary diseases', proPosition: 'Eliminating genetic diseases reduces suffering and improves quality of life', conPosition: 'Gene editing raises ethical concerns about consent and unintended consequences' },
        politics:     { topic: 'Compulsory voting strengthens democracy', proPosition: 'Mandatory voting ensures all voices are represented in democratic outcomes', conPosition: 'Forced voting violates individual freedom and may produce uninformed choices' },
        philosophy:   { topic: 'Free will is an illusion', proPosition: 'Deterministic neuroscience shows all choices are products of prior causes', conPosition: 'Conscious deliberation is real and cannot be reduced to physical processes' },
        ethics:       { topic: 'Civil disobedience is morally justified', proPosition: 'When laws are unjust, moral duty may require breaking them peacefully', conPosition: 'Undermining rule of law sets a dangerous precedent regardless of motivation' },
        education:    { topic: 'Standardised testing should be abolished', proPosition: 'Standardised tests measure test-taking ability, not true learning or potential', conPosition: 'Common metrics are necessary for fair evaluation and academic standards' },
        environment:  { topic: 'Nuclear energy is essential for achieving net-zero emissions', proPosition: 'Nuclear provides reliable zero-carbon baseload power that renewables cannot match', conPosition: 'Nuclear waste, cost overruns, and safety risks outweigh its climate benefits' },
        society:      { topic: 'Social media platforms should be regulated like public utilities', proPosition: 'The outsized societal influence of social media demands public accountability', conPosition: 'Heavy regulation stifles innovation and risks government censorship of speech' },
        general:      { topic: 'Remote work is better than office work for long-term productivity', proPosition: 'Reduced commuting and flexible hours increase focus and employee wellbeing', conPosition: 'Lack of in-person collaboration harms creativity, mentorship, and team cohesion' },
      };
      const fb = fallbacks[category] || fallbacks.general;
      return {
        success: true,
        data: {
          topic: fb.topic,
          proPosition: fb.proPosition,
          conPosition: fb.conPosition,
          proArguments: ['Supported by multiple independent studies', 'Widely adopted with measurable results', 'Addresses core inefficiencies in the current system'],
          conArguments: ['Implementation costs and transition risks are underestimated', 'Existing frameworks already address this concern adequately', 'Unintended consequences have not been sufficiently studied'],
          difficultyExplanation: `This topic is rated ${difficulty} because it requires ${difficulty === 'beginner' ? 'only everyday knowledge and personal experience' : difficulty === 'intermediate' ? 'some background knowledge of the subject area' : difficulty === 'advanced' ? 'in-depth understanding of multiple disciplines' : 'expert-level analysis and nuanced philosophical reasoning'}.`,
          suggestedEvidence: ['Peer-reviewed studies', 'Government statistics', 'Expert testimony', 'Case studies'],
        }
      };
    }
  }

  // AI vs AI debate generation
  async generateAIvsAIDebate(topic) {
    try {
      const prompt = `Generate a structured AI vs AI debate on the topic: "${topic}"

Create a realistic debate between:
- Aria (PRO): argues in favour of the topic
- Nova (ANTI): argues against the topic

Respond with ONLY valid JSON:
{
  "topic": "${topic}",
  "proAI": "Aria",
  "conAI": "Nova",
  "rounds": [
    {"speaker": "Aria", "type": "opening", "content": "Opening argument (2-3 sentences)"},
    {"speaker": "Nova", "type": "opening", "content": "Opening argument (2-3 sentences)"},
    {"speaker": "Aria", "type": "rebuttal", "content": "Rebuttal (2-3 sentences)"},
    {"speaker": "Nova", "type": "rebuttal", "content": "Rebuttal (2-3 sentences)"},
    {"speaker": "Aria", "type": "closing", "content": "Closing argument (2 sentences)"},
    {"speaker": "Nova", "type": "closing", "content": "Closing argument (2 sentences)"}
  ],
  "judgment": {
    "winner": "Aria|Nova|draw",
    "logicScore": {"Aria": 75, "Nova": 70},
    "evidenceScore": {"Aria": 65, "Nova": 80},
    "persuasionScore": {"Aria": 78, "Nova": 72},
    "rebuttalScore": {"Aria": 70, "Nova": 75},
    "explanation": "2-3 sentence judgment explanation"
  }
}`;

      const text = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      });

      const parsed = extractJSON(text);
      if (parsed) return { success: true, data: parsed };

      return { success: false, error: 'Failed to generate AI vs AI debate' };
    } catch (error) {
      console.error('AI vs AI error:', error.message);
      // Static fallback so the feature never crashes
      return {
        success: true,
        data: {
          topic,
          proAI: 'Aria',
          conAI: 'Nova',
          rounds: [
            { speaker: 'Aria', type: 'opening',  content: `The proposition "${topic}" stands on solid ground. Historical evidence and logical reasoning consistently support this position, and the benefits outweigh any potential drawbacks.` },
            { speaker: 'Nova', type: 'opening',  content: `I challenge the claim that "${topic}" holds universally. A careful examination reveals significant assumptions and contradictions that undermine this position.` },
            { speaker: 'Aria', type: 'rebuttal', content: `My opponent raises objections but fails to address the core evidence. The logical framework supporting this proposition remains intact and has not been refuted.` },
            { speaker: 'Nova', type: 'rebuttal', content: `The evidence presented relies on cherry-picked data. A broader, more rigorous analysis consistently challenges the central claims being made here.` },
            { speaker: 'Aria', type: 'closing',  content: `In conclusion, the case for this proposition is compelling and evidence-based. The opposition has not provided sufficient counter-evidence to undermine it.` },
            { speaker: 'Nova', type: 'closing',  content: `The burden of proof has not been met. Without stronger evidence, this proposition remains an interesting claim rather than a proven fact.` },
          ],
          judgment: {
            winner: 'draw',
            logicScore:      { Aria: 72, Nova: 70 },
            evidenceScore:   { Aria: 68, Nova: 65 },
            persuasionScore: { Aria: 74, Nova: 71 },
            rebuttalScore:   { Aria: 70, Nova: 73 },
            explanation: 'Both debaters presented structured arguments. Aria had a slight edge in persuasion while Nova challenged assumptions effectively. The debate ends in a draw on overall merit.',
          },
        }
      };
    }
  }

  // Update argument memory from conversation (extract user claims)
  async extractArgumentMemory(conversationHistory, topic) {
    // Lightweight local extraction — no API call needed
    const userMessages = conversationHistory
      .filter(m => m.sender === 'user' && m.content && m.content.trim().length > 20)
      .slice(-10);

    if (userMessages.length === 0) return { userClaims: [], contradictions: [] };

    // Extract simple claim sentences (heuristic: sentences with "is", "are", "should", "must", "will")
    const claimPatterns = /\b(is|are|should|must|will|cannot|can't|always|never|proves?|shows?|means?)\b/i;
    const userClaims = userMessages
      .map(m => {
        const sentences = m.content.split(/[.!?]/).filter(s => s.trim().length > 15 && claimPatterns.test(s));
        return sentences[0]?.trim() || m.content.substring(0, 100);
      })
      .filter(Boolean)
      .slice(-5);

    // Simple contradiction detection: look for semantic opposites
    const contradictions = [];
    const positiveWords = ['beneficial', 'good', 'helpful', 'useful', 'positive', 'harmless'];
    const negativeWords = ['harmful', 'bad', 'dangerous', 'negative', 'toxic', 'destructive'];

    let hasPositive = false, hasNegative = false;
    for (const msg of userMessages) {
      const lower = msg.content.toLowerCase();
      if (positiveWords.some(w => lower.includes(w))) hasPositive = true;
      if (negativeWords.some(w => lower.includes(w))) hasNegative = true;
    }
    if (hasPositive && hasNegative) {
      contradictions.push(`User has used both positive and negative characterizations of ${topic}`);
    }

    return { userClaims, contradictions };
  }

  // Generate educational feedback for a specific argument
  async generateFeedback(argument, fallacies = []) {
    try {
      const fallacyContext = fallacies.length > 0
        ? `\nDetected fallacies: ${fallacies.map(f => f.name).join(', ')}`
        : '';

      const prompt = `${FEEDBACK_SYSTEM_PROMPT}

Argument: "${argument}"${fallacyContext}

Respond with ONLY valid JSON:
{"logicScore":70,"persuasionScore":65,"clarity":75,"strengths":["point1"],"weaknesses":["point1"],"suggestions":["suggestion1"],"fallacyExplanations":[],"improvedVersion":"A stronger version would be..."}`;

      const text = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      });

      const parsed = extractJSON(text);
      if (parsed) return { success: true, data: parsed };
      return { success: true, data: { feedback: text } };
    } catch (error) {
      console.error('Gemini feedback error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Generate AI coaching tip
  async generateCoachingTip(userStats) {
    try {
      const prompt = `Based on these debate stats, give a short personalized coaching tip (2-3 sentences):
Stats: ${JSON.stringify(userStats)}
Focus on the most impactful improvement area.`;

      const tip = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text();
      });

      return { success: true, tip };
    } catch (error) {
      return { success: true, tip: 'Focus on backing your claims with specific evidence. The strongest debaters combine logical structure with concrete examples.' };
    }
  }

  // Explain a fallacy in educational context
  async explainFallacy(fallacyType, userArgument) {
    try {
      const prompt = `Explain the "${fallacyType}" logical fallacy as it appears in this argument: "${userArgument}"

Provide:
1. Why this is a ${fallacyType} fallacy
2. How it weakens the argument
3. A corrected version
4. A memorable tip to avoid it

Keep it educational and encouraging. 2-3 paragraphs max.`;

      const explanation = await this._generateWithFallback(async () => {
        const model = this._getModel();
        const result = await model.generateContent(prompt);
        return result.response.text();
      });

      return { success: true, explanation };
    } catch (error) {
      return { success: true, explanation: `This argument contains a ${fallacyType} fallacy. Focus on addressing the argument itself with evidence rather than using logical shortcuts.` };
    }
  }
}

module.exports = new GeminiService();
