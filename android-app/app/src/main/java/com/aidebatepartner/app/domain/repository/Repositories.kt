package com.aidebatepartner.app.domain.repository

import com.aidebatepartner.app.data.model.*
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.utils.Resource
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(email: String, password: String): Resource<Pair<User, String>>
    suspend fun register(username: String, email: String, password: String, difficultyLevel: String): Resource<Pair<User, String>>
    suspend fun logout(): Resource<Unit>
    suspend fun getMe(): Resource<User>
    suspend fun updateProfile(username: String?, bio: String?, difficultyLevel: String?): Resource<User>
    suspend fun forgotPassword(email: String): Resource<String>
    fun isLoggedIn(): Flow<Boolean>
    fun getSavedUser(): Flow<User?>
    suspend fun saveSession(user: User, token: String)
    suspend fun clearSession()
}

interface DebateRepository {
    suspend fun startDebate(
        topic: String,
        difficulty: String,
        aiPersonality: String,
        userPosition: String?
    ): Resource<Pair<Debate, DebateMessage>>

    suspend fun sendMessage(debateId: String, content: String): Resource<Pair<DebateMessage, DebateMessage>>
    suspend fun endDebate(debateId: String): Resource<DebateSummary>
    suspend fun getHistory(page: Int, limit: Int): Resource<List<Debate>>
    suspend fun getDebate(id: String): Resource<Pair<Debate, List<DebateMessage>>>
}

interface FallacyRepository {
    suspend fun analyzeText(text: String): Resource<FallacyAnalysisDto>
    suspend fun getLibrary(): Resource<List<FallacyLibraryItem>>
}

interface AnalyticsRepository {
    suspend fun getUserAnalytics(): Resource<Analytics>
}

interface TopicsRepository {
    suspend fun getTopics(category: String? = null, difficulty: String? = null, search: String? = null): Resource<List<Topic>>
}
