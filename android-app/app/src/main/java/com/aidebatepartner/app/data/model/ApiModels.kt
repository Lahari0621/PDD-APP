package com.aidebatepartner.app.data.model

import com.google.gson.annotations.SerializedName

// ─── Auth ───────────────────────────────────────────────────────────────────

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val difficultyLevel: String = "beginner"
)

data class AuthResponse(
    val success: Boolean,
    val message: String?,
    val token: String?,
    val user: UserDto?
)

data class UserDto(
    val id: String,
    val username: String,
    val email: String,
    val avatar: String?,
    val bio: String?,
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
    val achievements: List<AchievementDto>? = null,
    val preferredTopics: List<String>? = null
)

data class AchievementDto(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val unlockedAt: String
)

data class UpdateProfileRequest(
    val username: String?,
    val bio: String?,
    val difficultyLevel: String?,
    val preferredTopics: List<String>?
)

data class ForgotPasswordRequest(val email: String)

// ─── Debate ─────────────────────────────────────────────────────────────────

data class StartDebateRequest(
    val topic: String,
    val topicCategory: String? = null,
    val difficulty: String? = null,
    val aiPersonality: String? = null,
    val userPosition: String? = null
)

data class StartDebateResponse(
    val success: Boolean,
    val debate: DebateDto?,
    val openingMessage: MessageDto?
)

data class DebateDto(
    val id: String,
    val topic: String,
    val topicCategory: String? = null,
    val difficulty: String? = null,
    val aiPersonality: String? = null,
    val status: String? = null,
    val totalTurns: Int = 0,
    val finalScore: Int? = null,
    val winner: String? = null,
    val summary: String? = null,
    val xpEarned: Int? = null,
    val startedAt: String? = null,
    val endedAt: String? = null,
    val duration: Int? = null,
    val createdAt: String? = null
)

data class SendMessageRequest(
    val debateId: String,
    val content: String
)

data class SendMessageResponse(
    val success: Boolean,
    val userMessage: MessageDto?,
    val aiMessage: MessageDto?
)

data class MessageDto(
    val id: String,
    val sender: String,
    val content: String,
    val fallacies: List<FallacyDto>? = null,
    val hasFallacy: Boolean = false,
    val confidenceScore: Int? = null,
    val logicScore: Int? = null,
    val timestamp: String = "",
    val processingTime: Int? = null
)

data class EndDebateResponse(
    val success: Boolean,
    val summary: DebateSummaryDto?
)

data class DebateSummaryDto(
    val topic: String,
    val duration: Int,
    val totalTurns: Int,
    val winner: String?,
    val finalScore: Int,
    val xpEarned: Int,
    val summary: String?,
    val keyInsights: List<String>?,
    val improvementAreas: List<String>?,
    val strengths: List<String>?,
    val logicScore: Int,
    val persuasionScore: Int
)

data class DebateHistoryResponse(
    val success: Boolean,
    val debates: List<DebateDto>?,
    val pagination: PaginationDto?
)

data class PaginationDto(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
)

data class SingleDebateResponse(
    val success: Boolean,
    val debate: DebateDetailDto?
)

data class DebateDetailDto(
    val id: String,
    val topic: String,
    val topicCategory: String? = null,
    val difficulty: String,
    val aiPersonality: String,
    val status: String,
    val messages: List<MessageDto>?,
    val totalTurns: Int,
    val finalScore: Int?,
    val winner: String?,
    val summary: String?,
    val xpEarned: Int?,
    val createdAt: String
)

// ─── Fallacy ────────────────────────────────────────────────────────────────

data class FallacyDto(
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
    val correction: String? = null,
    val detectionMethod: String? = null
)

data class AnalyzeTextRequest(val text: String)

data class AnalyzeTextResponse(
    val success: Boolean,
    val analysis: FallacyAnalysisDto?
)

data class FallacyAnalysisDto(
    val text: String,
    val hasFallacy: Boolean,
    val fallacies: List<FallacyDto>?,
    val confidenceScore: Int,
    val overallConfidence: Double,
    val aiExplanation: String?,
    val processingTime: Int,
    val recommendation: String
)

data class FallacyLibraryResponse(
    val success: Boolean,
    val fallacies: List<FallacyLibraryItemDto>?,
    val total: Int
)

data class FallacyLibraryItemDto(
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
    val tips: List<String>?
)

// ─── Analytics ──────────────────────────────────────────────────────────────

data class AnalyticsResponse(
    val success: Boolean,
    val analytics: AnalyticsDto?
)

data class AnalyticsDto(
    val overview: AnalyticsOverviewDto?,
    val skills: SkillsDto?,
    val recentDebates: List<DebateDto>?,
    val categoryPerformance: List<CategoryPerformanceDto>?,
    val logicScoreHistory: List<ScoreHistoryDto>?,
    val weeklyActivity: List<WeeklyActivityDto>?,
    val fallacyBreakdown: List<FallacyBreakdownDto>?,
    val coachingTip: String?
)

data class AnalyticsOverviewDto(
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

data class SkillsDto(
    val logic: Int,
    val persuasion: Int,
    val evidence: Int,
    val clarity: Int,
    val rebuttal: Int,
    val structure: Int
)

data class CategoryPerformanceDto(
    @SerializedName("_id") val id: String,
    val count: Int,
    val avgScore: Double,
    val wins: Int
)

data class ScoreHistoryDto(
    val date: String,
    val score: Int
)

data class WeeklyActivityDto(
    val date: String,
    val count: Int,
    val xp: Int
)

data class FallacyBreakdownDto(
    val type: String,
    val count: Int
)

// ─── Topics ─────────────────────────────────────────────────────────────────

data class TopicsResponse(
    val success: Boolean,
    val topics: List<TopicDto>?,
    val total: Int
)

data class TopicDto(
    val id: String,
    val title: String,
    val category: String,
    val difficulty: String,
    val icon: String,
    val tags: List<String>,
    val debateCount: Int,
    val description: String?
)

// ─── Generic ────────────────────────────────────────────────────────────────

data class GenericResponse(
    val success: Boolean,
    val message: String?,
    val error: String?
)
