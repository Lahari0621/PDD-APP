const axios = require('axios');
require('dotenv').config();

// Rule-based fallacy patterns with rich explanation data
const FALLACY_PATTERNS = [
  {
    type: 'ad_hominem',
    name: 'Ad Hominem',
    patterns: [
      /you('re| are) (too |just )?(stupid|dumb|ignorant|naive|inexperienced|young|old|biased)/i,
      /what do you know about/i,
      /you don't (even |)understand/i,
      /coming from (someone|a person) (like|who)/i,
      /you('re| are) not (qualified|smart|educated) enough/i,
      /only (an idiot|a fool|someone stupid)/i,
      /you have no (idea|clue|experience)/i,
    ],
    description: 'Attacking the person making the argument rather than the argument itself.',
    why: 'This attacks the speaker\'s character or background instead of addressing the actual argument presented.',
    correction: 'Focus on the argument itself — explain why the claim is incorrect with evidence or logic.',
    severity: 'high',
    color: '#EF4444',
  },
  {
    type: 'strawman',
    name: 'Straw Man',
    patterns: [
      /so you('re| are) saying (that |)we should/i,
      /you want (everyone|us|people) to/i,
      /that means you (think|believe|want)/i,
      /so your position is that/i,
      /you('re| are) basically saying/i,
    ],
    description: 'Misrepresenting someone\'s argument to make it easier to attack.',
    why: 'This distorts or exaggerates the opponent\'s position, then argues against that distorted version instead.',
    correction: 'Accurately represent the opposing view before responding to it — ask for clarification if needed.',
    severity: 'high',
    color: '#F59E0B',
  },
  {
    type: 'slippery_slope',
    name: 'Slippery Slope',
    patterns: [
      /if (we|you|they) (allow|do|accept|permit) .{0,50} (then|next|soon|eventually)/i,
      /this will (lead|result|end) in/i,
      /before (you know it|long)/i,
      /the next thing (you know|will happen)/i,
      /it('s| is) only a matter of time before/i,
      /once (we|you|they) start/i,
    ],
    description: 'Assuming one event will lead to extreme consequences without justification.',
    why: 'This assumes a chain of events will inevitably follow without providing evidence for each step in the chain.',
    correction: 'Provide evidence for each causal link, or acknowledge the intermediate steps that would need to occur.',
    severity: 'medium',
    color: '#8B5CF6',
  },
  {
    type: 'appeal_to_emotion',
    name: 'Appeal to Emotion',
    patterns: [
      /think of the children/i,
      /how (would|could) you (feel|live with yourself)/i,
      /it('s| is) (heartbreaking|devastating|tragic|horrifying)/i,
      /don't you (care|feel|have a heart)/i,
      /imagine (how|if|the)/i,
      /what about the (victims|families|people)/i,
    ],
    description: 'Manipulating emotions rather than using logical reasoning to support a claim.',
    why: 'This substitutes emotional language for actual evidence, attempting to persuade through feeling rather than logic.',
    correction: 'Support any emotional appeal with concrete evidence, data, or logical reasoning.',
    severity: 'medium',
    color: '#EC4899',
  },
  {
    type: 'false_dilemma',
    name: 'False Dilemma',
    patterns: [
      /either (you|we|they).{0,50}or (you|we|they)/i,
      /you('re| are) either .{0,50} or/i,
      /there are only two (options|choices|ways)/i,
      /it('s| is) (either|either\/or)/i,
      /if you('re| are) not .{0,30} then you('re| are)/i,
      /you can't (have|be) both/i,
    ],
    description: 'Presenting only two options when more exist.',
    why: 'This artificially limits the choices to two, ignoring other valid alternatives or middle-ground positions.',
    correction: 'Acknowledge the full spectrum of possibilities and explain why the other options are not viable.',
    severity: 'high',
    color: '#06B6D4',
  },
  {
    type: 'bandwagon',
    name: 'Bandwagon',
    patterns: [
      /everyone (knows|believes|thinks|agrees)/i,
      /most people (think|believe|agree|know)/i,
      /the majority (of people|believe|think)/i,
      /it('s| is) (common|widely) (known|accepted|believed)/i,
      /millions of people (can't|cannot) be wrong/i,
      /everybody (does|is doing|knows)/i,
    ],
    description: 'Arguing something is true because many people believe it.',
    why: 'Popularity does not establish truth — history is full of things that were widely believed but wrong.',
    correction: 'Provide objective evidence for the claim rather than relying on its popularity.',
    severity: 'medium',
    color: '#10B981',
  },
  {
    type: 'hasty_generalization',
    name: 'Hasty Generalization',
    patterns: [
      /all (people|men|women|politicians|scientists|experts)/i,
      /every (single|time|person|one)/i,
      /none of (them|the|those)/i,
      /they (always|never|all)/i,
      /that('s| is) (always|never) the case/i,
      /this proves that all/i,
    ],
    description: 'Drawing broad conclusions from limited examples.',
    why: 'A conclusion based on too small or unrepresentative a sample is unreliable and likely inaccurate.',
    correction: 'Qualify your generalisation — use "some", "many", or "in these cases" instead of absolute terms.',
    severity: 'medium',
    color: '#F97316',
  },
  {
    type: 'appeal_to_authority',
    name: 'Appeal to Authority',
    patterns: [
      /experts (say|agree|believe|think)/i,
      /scientists (have proven|say|agree)/i,
      /studies (show|prove|indicate)/i,
      /according to (experts|scientists|researchers)/i,
      /as (any|every) expert (knows|will tell you)/i,
    ],
    description: 'Using authority as evidence without proper citation or context.',
    why: 'Citing unnamed or irrelevant authorities without the actual evidence provides no logical support for a claim.',
    correction: 'Cite specific, relevant experts with verifiable credentials, and include the actual evidence they provide.',
    severity: 'low',
    color: '#6366F1',
  },
  {
    type: 'circular_reasoning',
    name: 'Circular Reasoning',
    patterns: [
      /because (it|that|this) is (true|right|correct|the case)/i,
      /it('s| is) (true|right|correct) because (it|that|this) is/i,
      /the (bible|book|text) is true because (god|it) says so/i,
    ],
    description: 'Using the conclusion as a premise in the argument.',
    why: 'The argument\'s conclusion is assumed in its own premises, making it logically circular with no independent support.',
    correction: 'Provide independent premises that support the conclusion without assuming it is already true.',
    severity: 'high',
    color: '#DC2626',
  },
  {
    type: 'red_herring',
    name: 'Red Herring',
    patterns: [
      /but what about/i,
      /you should be more concerned about/i,
      /that('s| is) not (even|the) (the |)real issue/i,
      /let('s| us) not forget that/i,
      /more importantly/i,
    ],
    description: 'Introducing irrelevant information to distract from the main argument.',
    why: 'This shifts focus to an unrelated topic, avoiding the actual argument rather than addressing it.',
    correction: 'Stay on topic — if there is a separate issue worth discussing, address the current argument first.',
    severity: 'medium',
    color: '#7C3AED',
  },
];

class FallacyDetector {
  constructor() {
    this.hfApiKey = process.env.HUGGINGFACE_API_KEY;
    this.hfApiUrl = 'https://api-inference.huggingface.co/models/';
    this._hfDead  = false; // set true on DNS/network failure to stop retrying
  }

  // Rule-based detection — improved with explanation + correction per match
  detectWithRules(text) {
    const detected = [];
    // Minimum length guard — very short texts produce too many false positives
    if (!text || text.trim().length < 15) return detected;
    
    for (const fallacy of FALLACY_PATTERNS) {
      for (const pattern of fallacy.patterns) {
        const match = text.match(pattern);
        if (match) {
          const matchIndex = text.search(pattern);
          const matchText  = match[0];
          
          if (!detected.find(d => d.type === fallacy.type)) {
            detected.push({
              type:            fallacy.type,
              name:            fallacy.name,
              description:     fallacy.description,
              why:             fallacy.why || `This argument uses ${fallacy.name}, which ${fallacy.description.toLowerCase()}`,
              correction:      fallacy.correction || `Try addressing the argument directly with evidence instead.`,
              highlightedText: matchText,
              startIndex:      matchIndex,
              endIndex:        matchIndex + matchText.length,
              confidence:      0.75 + Math.random() * 0.2,
              severity:        fallacy.severity,
              color:           fallacy.color,
              detectionMethod: 'rule-based',
            });
          }
          break;
        }
      }
    }
    
    return detected;
  }

  // Hugging Face NLP classification
  async detectWithHuggingFace(text) {
    try {
      // Use zero-shot classification for fallacy detection
      const response = await axios.post(
        `${this.hfApiUrl}facebook/bart-large-mnli`,
        {
          inputs: text,
          parameters: {
            candidate_labels: [
              'ad hominem attack',
              'straw man argument',
              'slippery slope fallacy',
              'appeal to emotion',
              'false dilemma',
              'bandwagon fallacy',
              'hasty generalization',
              'logical reasoning',
              'valid argument',
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.hfApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      const { labels, scores } = response.data;
      const fallacyLabels = labels.slice(0, -2); // exclude 'logical reasoning' and 'valid argument'
      const fallacyScores = scores.slice(0, -2);

      const detected = [];
      for (let i = 0; i < fallacyLabels.length; i++) {
        if (fallacyScores[i] > 0.4) { // threshold
          const fallacyType = this.mapLabelToType(fallacyLabels[i]);
          const fallacyInfo = FALLACY_PATTERNS.find(f => f.type === fallacyType);
          
          if (fallacyInfo) {
            detected.push({
              type:            fallacyType,
              name:            fallacyInfo.name,
              description:     fallacyInfo.description,
              why:             fallacyInfo.why || fallacyInfo.description,
              correction:      fallacyInfo.correction || 'Strengthen your argument with specific evidence.',
              highlightedText: text.substring(0, Math.min(50, text.length)),
              confidence:      fallacyScores[i],
              severity:        fallacyInfo.severity,
              color:           fallacyInfo.color,
              detectionMethod: 'huggingface',
            });
          }
        }
      }
      
      return detected;
    } catch (error) {
      // Mark HuggingFace as permanently unavailable on DNS/network errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this._hfDead = true;
      }
      // Don't log on every call once dead
      if (!this._hfDead) {
        console.error('HuggingFace API error:', error.message);
      }
      return []; // Fallback gracefully
    }
  }

  mapLabelToType(label) {
    const mapping = {
      'ad hominem attack': 'ad_hominem',
      'straw man argument': 'strawman',
      'slippery slope fallacy': 'slippery_slope',
      'appeal to emotion': 'appeal_to_emotion',
      'false dilemma': 'false_dilemma',
      'bandwagon fallacy': 'bandwagon',
      'hasty generalization': 'hasty_generalization',
    };
    return mapping[label] || 'unknown';
  }

  // Hybrid detection: combine rule-based + HuggingFace
  // HuggingFace is skipped if the API key is missing or network is unavailable
  async detect(text) {
    try {
      const ruleBasedResults = this.detectWithRules(text);

      // Only call HuggingFace if we have a key AND the previous call didn't fail with DNS
      let hfResults = [];
      if (this.hfApiKey && !this._hfDead) {
        hfResults = await this.detectWithHuggingFace(text);
      }

      // Merge results, prioritizing rule-based for exact matches
      const merged = [...ruleBasedResults];
      
      for (const hfResult of hfResults) {
        const existing = merged.find(r => r.type === hfResult.type);
        if (existing) {
          existing.confidence = Math.min(0.99, (existing.confidence + hfResult.confidence) / 2 + 0.1);
          existing.detectionMethod = 'hybrid';
        } else if (hfResult.confidence > 0.5) {
          merged.push(hfResult);
        }
      }

      return {
        hasFallacy: merged.length > 0,
        fallacies: merged,
        overallConfidence: merged.length > 0 
          ? merged.reduce((sum, f) => sum + f.confidence, 0) / merged.length 
          : 0,
      };
    } catch (error) {
      console.error('Fallacy detection error:', error);
      const ruleResults = this.detectWithRules(text);
      return {
        hasFallacy: ruleResults.length > 0,
        fallacies: ruleResults,
        overallConfidence: ruleResults.length > 0 ? 0.75 : 0,
      };
    }
  }

  // Get all fallacy types for library
  getAllFallacyTypes() {
    return FALLACY_PATTERNS.map(f => ({
      type: f.type,
      name: f.name,
      description: f.description,
      severity: f.severity,
      color: f.color,
    }));
  }
}

module.exports = new FallacyDetector();
