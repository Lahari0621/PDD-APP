const getTopics = async (req, res) => {
  try {
    const topics = [
      { id: '1', title: 'Social media does more harm than good', category: 'social', difficulty: 'beginner', icon: '📱', tags: ['technology', 'society'], debateCount: 1240 },
      { id: '2', title: 'Artificial intelligence will eliminate more jobs than it creates', category: 'technology', difficulty: 'intermediate', icon: '🤖', tags: ['AI', 'economy'], debateCount: 980 },
      { id: '3', title: 'Universal Basic Income should be implemented globally', category: 'economics', difficulty: 'advanced', icon: '💰', tags: ['economics', 'policy'], debateCount: 756 },
      { id: '4', title: 'Climate change is the most pressing issue of our time', category: 'environment', difficulty: 'intermediate', icon: '🌍', tags: ['environment', 'policy'], debateCount: 1100 },
      { id: '5', title: 'Capital punishment should be abolished worldwide', category: 'ethics', difficulty: 'advanced', icon: '⚖️', tags: ['ethics', 'law'], debateCount: 634 },
      { id: '6', title: 'Space exploration is worth the investment', category: 'science', difficulty: 'intermediate', icon: '🚀', tags: ['science', 'economics'], debateCount: 890 },
      { id: '7', title: 'Democracy is the best form of government', category: 'politics', difficulty: 'advanced', icon: '🗳️', tags: ['politics', 'philosophy'], debateCount: 1450 },
      { id: '8', title: 'Genetic engineering of humans should be permitted', category: 'ethics', difficulty: 'expert', icon: '🧬', tags: ['science', 'ethics'], debateCount: 423 },
      { id: '9', title: 'Online education is superior to traditional education', category: 'social', difficulty: 'beginner', icon: '📚', tags: ['education', 'technology'], debateCount: 1678 },
      { id: '10', title: 'Cryptocurrency will replace traditional banking', category: 'economics', difficulty: 'intermediate', icon: '₿', tags: ['finance', 'technology'], debateCount: 789 },
      { id: '11', title: 'Veganism is the most ethical diet', category: 'ethics', difficulty: 'beginner', icon: '🌱', tags: ['ethics', 'environment'], debateCount: 2100 },
      { id: '12', title: 'Nuclear energy is essential for a sustainable future', category: 'environment', difficulty: 'advanced', icon: '⚛️', tags: ['energy', 'environment'], debateCount: 567 },
    ];

    const { category, difficulty, search } = req.query;
    let filtered = topics;

    if (category) filtered = filtered.filter(t => t.category === category);
    if (difficulty) filtered = filtered.filter(t => t.difficulty === difficulty);
    if (search) filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    res.json({ success: true, topics: filtered, total: filtered.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get topics' });
  }
};

module.exports = { getTopics };
