package com.aidebatepartner.app.data.repository

import com.aidebatepartner.app.data.model.*
import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.domain.repository.DebateRepository
import com.aidebatepartner.app.utils.Resource
import com.aidebatepartner.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DebateRepositoryImpl @Inject constructor(
    private val api: ApiService
) : DebateRepository {

    override suspend fun startDebate(
        topic: String, difficulty: String, aiPersonality: String, userPosition: String?
    ): Resource<Pair<Debate, DebateMessage>> {
        val result = safeApiCall {
            api.startDebate(StartDebateRequest(topic, null, difficulty, aiPersonality, userPosition))
        }
        return when (result) {
            is Resource.Success -> {
                val debate = result.data.debate?.toDomain() ?: return Resource.Error("No debate data")
                val msg = result.data.openingMessage?.toDomain() ?: return Resource.Error("No opening message")
                Resource.Success(Pair(debate, msg))
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun sendMessage(
        debateId: String, content: String
    ): Resource<Pair<DebateMessage, DebateMessage>> {
        val result = safeApiCall { api.sendMessage(SendMessageRequest(debateId, content)) }
        return when (result) {
            is Resource.Success -> {
                val userMsg = result.data.userMessage?.toDomain() ?: return Resource.Error("No user message")
                val aiMsg = result.data.aiMessage?.toDomain() ?: return Resource.Error("No AI message")
                Resource.Success(Pair(userMsg, aiMsg))
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun endDebate(debateId: String): Resource<DebateSummary> {
        val result = safeApiCall { api.endDebate(mapOf("debateId" to debateId)) }
        return when (result) {
            is Resource.Success -> {
                val summary = result.data.summary?.toDomain() ?: return Resource.Error("No summary")
                Resource.Success(summary)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun getHistory(page: Int, limit: Int): Resource<List<Debate>> {
        val result = safeApiCall { api.getDebateHistory(page, limit) }
        return when (result) {
            is Resource.Success -> Resource.Success(result.data.debates?.map { it.toDomain() } ?: emptyList())
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun getDebate(id: String): Resource<Pair<Debate, List<DebateMessage>>> {
        val result = safeApiCall { api.getDebate(id) }
        return when (result) {
            is Resource.Success -> {
                val detail = result.data.debate ?: return Resource.Error("Not found")
                val debate = Debate(
                    id = detail.id,
                    topic = detail.topic,
                    topicCategory = detail.topicCategory ?: "custom",
                    difficulty = detail.difficulty,
                    aiPersonality = detail.aiPersonality,
                    status = detail.status,
                    totalTurns = detail.totalTurns,
                    finalScore = detail.finalScore,
                    winner = detail.winner,
                    summary = detail.summary,
                    xpEarned = detail.xpEarned,
                    createdAt = detail.createdAt
                )
                val messages = detail.messages?.map { it.toDomain() } ?: emptyList()
                Resource.Success(Pair(debate, messages))
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    private fun DebateDto.toDomain() = Debate(
        id = id,
        topic = topic,
        topicCategory = topicCategory ?: "custom",
        difficulty = difficulty ?: "intermediate",
        aiPersonality = aiPersonality ?: "logical",
        status = status ?: "active",
        totalTurns = totalTurns,
        finalScore = finalScore,
        winner = winner,
        summary = summary,
        xpEarned = xpEarned,
        startedAt = startedAt ?: "",
        endedAt = endedAt,
        duration = duration,
        createdAt = createdAt ?: ""
    )

    private fun MessageDto.toDomain() = DebateMessage(
        id = id, sender = sender, content = content,
        fallacies = fallacies?.map { f ->
            Fallacy(
                type = f.type, name = f.name, description = f.description,
                highlightedText = f.highlightedText, startIndex = f.startIndex,
                endIndex = f.endIndex, confidence = f.confidence, severity = f.severity,
                color = f.color, explanation = f.explanation, correction = f.correction
            )
        } ?: emptyList(),
        hasFallacy = hasFallacy, confidenceScore = confidenceScore,
        logicScore = logicScore, timestamp = timestamp, processingTime = processingTime
    )

    private fun DebateSummaryDto.toDomain() = DebateSummary(
        topic = topic, duration = duration, totalTurns = totalTurns, winner = winner,
        finalScore = finalScore, xpEarned = xpEarned, summary = summary,
        keyInsights = keyInsights ?: emptyList(), improvementAreas = improvementAreas ?: emptyList(),
        strengths = strengths ?: emptyList(), logicScore = logicScore, persuasionScore = persuasionScore
    )
}
