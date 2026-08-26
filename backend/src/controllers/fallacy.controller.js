const fallacyDetector = require('../ai/fallacy.detector');
const geminiService = require('../ai/gemini.service');

// Analyze text for fallacies
const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for analysis' });
    }

    if (text.length > 2000) {
      return res.status(400).json({ error: 'Text too long. Maximum 2000 characters.' });
    }

    const startTime = Date.now();
    const result = await fallacyDetector.detect(text);
    const processingTime = Date.now() - startTime;

    // Calculate confidence score
    const confidenceScore = result.hasFallacy
      ? Math.max(20, 100 - (result.fallacies.length * 15))
      : 85 + Math.floor(Math.random() * 15);

    // Get AI explanation if fallacies found
    let aiExplanation = null;
    if (result.hasFallacy && result.fallacies.length > 0) {
      const explanationResult = await geminiService.explainFallacy(
        result.fallacies[0].name,
        text
      );
      aiExplanation = explanationResult.explanation;
    }

    res.json({
      success: true,
      analysis: {
        text,
        hasFallacy: result.hasFallacy,
        fallacies: result.fallacies,
        confidenceScore,
        overallConfidence: result.overallConfidence,
        aiExplanation,
        processingTime,
        recommendation: result.hasFallacy
          ? 'Your argument contains logical fallacies. Consider strengthening it with evidence-based reasoning.'
          : 'Your argument appears logically sound. Keep building on this foundation!',
      },
    });
  } catch (error) {
    console.error('Fallacy analysis error:', error);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
};

// Get fallacy library
const getFallacyLibrary = async (req, res) => {
  try {
    const fallacies = [
      {
        type: 'ad_hominem',
        name: 'Ad Hominem',
        category: 'relevance',
        description: 'Attacking the person making the argument rather than the argument itself.',
        shortDescription: 'Personal attack instead of addressing the argument',
        example: '"You\'re too young to understand economics, so your point is invalid."',
        correctedExample: '"Your economic argument has a flaw: it doesn\'t account for inflation rates."',
        severity: 'high',
        color: '#EF4444',
        icon: '👤',
        tips: ['Focus on the argument, not the person', 'Address the content, not the source'],
      },
      {
        type: 'strawman',
        name: 'Straw Man',
        category: 'relevance',
        description: 'Misrepresenting someone\'s argument to make it easier to attack.',
        shortDescription: 'Distorting an argument to make it easier to defeat',
        example: '"So you want to cut military spending? You want us to be defenseless!"',
        correctedExample: '"I disagree with cutting military spending because it could reduce our defensive capabilities."',
        severity: 'high',
        color: '#F59E0B',
        icon: '🎭',
        tips: ['Represent the opposing view accurately', 'Ask for clarification before countering'],
      },
      {
        type: 'slippery_slope',
        name: 'Slippery Slope',
        category: 'presumption',
        description: 'Assuming one event will inevitably lead to extreme consequences without justification.',
        shortDescription: 'Assuming extreme consequences without evidence',
        example: '"If we allow same-sex marriage, next people will want to marry animals."',
        correctedExample: '"Changing marriage laws could have various social implications worth examining."',
        severity: 'medium',
        color: '#8B5CF6',
        icon: '📉',
        tips: ['Provide evidence for causal chain', 'Acknowledge intermediate steps'],
      },
      {
        type: 'appeal_to_emotion',
        name: 'Appeal to Emotion',
        category: 'relevance',
        description: 'Manipulating emotions rather than using logical reasoning to support a claim.',
        shortDescription: 'Using emotions instead of logic',
        example: '"Think of the children! We must ban this immediately!"',
        correctedExample: '"Research shows this policy negatively impacts child development in these specific ways."',
        severity: 'medium',
        color: '#EC4899',
        icon: '💔',
        tips: ['Support emotional appeals with evidence', 'Use data alongside emotional context'],
      },
      {
        type: 'false_dilemma',
        name: 'False Dilemma',
        category: 'presumption',
        description: 'Presenting only two options when more alternatives exist.',
        shortDescription: 'Limiting choices to only two when more exist',
        example: '"You\'re either with us or against us."',
        correctedExample: '"There are several positions one could take on this issue, including..."',
        severity: 'high',
        color: '#06B6D4',
        icon: '⚖️',
        tips: ['Explore all available options', 'Acknowledge nuance and middle ground'],
      },
      {
        type: 'bandwagon',
        name: 'Bandwagon',
        category: 'relevance',
        description: 'Arguing something is true or good because many people believe or do it.',
        shortDescription: 'Appeal to popularity',
        example: '"Everyone is investing in crypto, so it must be a good investment."',
        correctedExample: '"Cryptocurrency has shown X% returns over Y period, though with significant volatility."',
        severity: 'medium',
        color: '#10B981',
        icon: '🚂',
        tips: ['Popularity doesn\'t equal truth', 'Evaluate claims on their own merits'],
      },
      {
        type: 'hasty_generalization',
        name: 'Hasty Generalization',
        category: 'presumption',
        description: 'Drawing broad conclusions from a small or unrepresentative sample.',
        shortDescription: 'Overgeneralizing from limited examples',
        example: '"I met two rude people from that city, so everyone there must be rude."',
        correctedExample: '"Based on a representative survey of 1000 residents, the city has a hospitality rating of..."',
        severity: 'medium',
        color: '#F97316',
        icon: '🔍',
        tips: ['Use representative samples', 'Qualify your generalizations'],
      },
      {
        type: 'appeal_to_authority',
        name: 'Appeal to Authority',
        category: 'relevance',
        description: 'Using an authority figure\'s opinion as evidence without proper context.',
        shortDescription: 'Citing authority without proper evidence',
        example: '"A famous actor said vaccines are dangerous, so they must be."',
        correctedExample: '"According to peer-reviewed studies published in The Lancet, vaccines show..."',
        severity: 'low',
        color: '#6366F1',
        icon: '👑',
        tips: ['Cite relevant experts in their field', 'Provide the actual evidence, not just the source'],
      },
      {
        type: 'circular_reasoning',
        name: 'Circular Reasoning',
        category: 'formal',
        description: 'Using the conclusion as a premise in the argument (begging the question).',
        shortDescription: 'Using the conclusion as evidence for itself',
        example: '"The Bible is true because God wrote it, and we know God wrote it because the Bible says so."',
        correctedExample: '"Historical and archaeological evidence supports several accounts in the Bible, such as..."',
        severity: 'high',
        color: '#DC2626',
        icon: '🔄',
        tips: ['Ensure premises are independent of conclusion', 'Provide external evidence'],
      },
      {
        type: 'red_herring',
        name: 'Red Herring',
        category: 'relevance',
        description: 'Introducing irrelevant information to distract from the main argument.',
        shortDescription: 'Distracting with irrelevant information',
        example: '"Why worry about climate change when there\'s so much poverty in the world?"',
        correctedExample: '"Both climate change and poverty are critical issues that require simultaneous attention."',
        severity: 'medium',
        color: '#7C3AED',
        icon: '🐟',
        tips: ['Stay focused on the main argument', 'Address distractions directly'],
      },
    ];

    res.json({ success: true, fallacies, total: fallacies.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fallacy library' });
  }
};

module.exports = { analyzeText, getFallacyLibrary };
