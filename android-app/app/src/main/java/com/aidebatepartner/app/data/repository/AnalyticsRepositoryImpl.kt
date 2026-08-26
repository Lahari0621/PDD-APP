package com.aidebatepartner.app.data.repository

import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.domain.repository.AnalyticsRepository
import com.aidebatepartner.app.utils.Resource
import com.aidebatepartner.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AnalyticsRepositoryImpl @Inject constructor(
    private val api: ApiService
) : AnalyticsRepository {

    override suspend fun getUserAnalytics(): Resource<Analytics> {
        val result = safeApiCall { api.getUserAnalytics() }
        return when (result) {
            is Resource.Success -> {
                val analyticsDto = result.data.analytics ?: return Resource.Error("No analytics data")
                val analytics = Analytics(
                    overview = analyticsDto.overview?.let {
                        AnalyticsOverview(
                            totalDebates = it.totalDebates,
                            debatesWon = it.debatesWon,
                            winRate = it.winRate,
                            totalXp = it.totalXp,
                            level = it.level,
                            tier = it.tier ?: "Bronze",
                            streak = it.streak,
                            longestStreak = it.longestStreak,
                            logicScore = it.logicScore,
                            totalFallaciesDetected = it.totalFallaciesDetected
                        )
                    } ?: AnalyticsOverview(0, 0, 0, 0, 1, "Bronze", 0, 0, 50, 0),
                    skills = analyticsDto.skills?.let {
                        Skills(
                            logic = it.logic,
                            persuasion = it.persuasion,
                            evidence = it.evidence,
                            clarity = it.clarity,
                            rebuttal = it.rebuttal,
                            structure = it.structure
                        )
                    } ?: Skills(50, 50, 50, 50, 50, 50),
                    recentDebates = analyticsDto.recentDebates?.map { d ->
                        Debate(
                            id = d.id ?: "",
                            topic = d.topic ?: "",
                            topicCategory = d.topicCategory ?: "custom",
                            difficulty = d.difficulty ?: "intermediate",
                            aiPersonality = d.aiPersonality ?: "logical",
                            status = d.status ?: "active",
                            totalTurns = d.totalTurns,
                            finalScore = d.finalScore,
                            winner = d.winner,
                            summary = d.summary,
                            xpEarned = d.xpEarned,
                            startedAt = d.startedAt ?: "",
                            endedAt = d.endedAt,
                            duration = d.duration,
                            createdAt = d.createdAt ?: ""
                        )
                    } ?: emptyList(),
                    logicScoreHistory = analyticsDto.logicScoreHistory?.map {
                        ScorePoint(date = it.date ?: "", score = it.score)
                    } ?: emptyList(),
                    fallacyBreakdown = analyticsDto.fallacyBreakdown?.map {
                        FallacyBreakdown(type = it.type ?: "", count = it.count)
                    } ?: emptyList(),
                    coachingTip = analyticsDto.coachingTip ?: "Keep practicing to improve your debate skills!"
                )
                Resource.Success(analytics)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }
}
