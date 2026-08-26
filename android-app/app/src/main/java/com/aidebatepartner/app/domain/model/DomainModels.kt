package com.aidebatepartner.app.domain.model

data class User(
    val id: String,
    val username: String,
    val email: String,
    val avatar: String? = null,
    val bio: String? = null,
    val xp: Int = 0,
    val level: Int = 1,
    val tier: String = "Bronze",
    val streak: Int = 0,
    val longestStreak: Int = 0,
    val plan: String = "free",
    val role: String = "user",
    val difficultyLevel: String = "beginner",
    val totalDebates: Int = 0,
    val debatesWon: Int = 0,
    val logicScore: Int = 50,
    val totalFallaciesDetected: Int = 0,
    val achievements: List<Achievement> = emptyList(),
    val preferredTopics: List<String> = emptyList()
)

data class Achievement(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val unlockedAt: String
)

data class Debate(
    val id: String,
    val topic: String,
    val topicCategory: String = "custom",
    val difficulty: String = "intermediate",
    val aiPersonality: String = "logical",
    val status: String = "active",
    val totalTurns: Int = 0,
    val finalScore: Int? = null,
    val winner: String? = null,
    val summary: String? = null,
    val xpEarned: Int? = null,
    val startedAt: String = "",
    val endedAt: String? = null,
    val duration: Int? = null,
    val createdAt: String = ""
)

data class DebateMessage(
    val id: String,
    val sender: String, // "user" | "ai"
    val content: String,
    val fallacies: List<Fallacy> = emptyList(),
    val hasFallacy: Boolean = false,
    val confidenceScore: Int? = null,
    val logicScore: Int? = null,
    val timestamp: String = "",
    val processingTime: Int? = null
)

data class Fallacy(
    val type: String,
    val name: String,
    val description: String,
    val highlightedText: String? = null,
    val startIndex: Int? = null,
    val endIndex: Int? = null,
    val confidence: Double = 0.0,
    val severity: String? = null,
    val color: String? = null,
    val explanation: String? = null,
    val correction: String? = null
)

data class DebateSummary(
    val topic: String,
    val duration: Int,
    val totalTurns: Int,
    val winner: String?,
    val finalScore: Int,
    val xpEarned: Int,
    val summary: String?,
    val keyInsights: List<String>,
    val improvementAreas: List<String>,
    val strengths: List<String>,
    val logicScore: Int,
    val persuasionScore: Int
)

data class FallacyLibraryItem(
    val type: String,
    val name: String,
    val category: String,
    val description: String,
    val shortDescription: String,
    val example: String,
    val correctedExample: String,
    val severity: String,
    val color: String,
    val icon: String,
    val tips: List<String> = emptyList()
)

data class Analytics(
    val overview: AnalyticsOverview,
    val skills: Skills,
    val recentDebates: List<Debate>,
    val logicScoreHistory: List<ScorePoint>,
    val fallacyBreakdown: List<FallacyBreakdown>,
    val coachingTip: String
)

data class AnalyticsOverview(
    val totalDebates: Int,
    val debatesWon: Int,
    val winRate: Int,
    val totalXp: Int,
    val level: Int,
    val tier: String,
    val streak: Int,
    val longestStreak: Int,
    val logicScore: Int,
    val totalFallaciesDetected: Int
)

data class Skills(
    val logic: Int,
    val persuasion: Int,
    val evidence: Int,
    val clarity: Int,
    val rebuttal: Int,
    val structure: Int
)

data class ScorePoint(val date: String, val score: Int)

data class FallacyBreakdown(val type: String, val count: Int)

data class Topic(
    val id: String,
    val title: String,
    val category: String,
    val difficulty: String,
    val icon: String,
    val tags: List<String>,
    val debateCount: Int
)

data class QuizQuestion(
    val id: Int,
    val question: String,
    val options: List<String>,
    val correct: Int,
    val explanation: String
)

data class FlashCard(
    val front: String,
    val back: String,
    val color: String,
    val icon: String
)
