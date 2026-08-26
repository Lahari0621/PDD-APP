package com.aidebatepartner.app.data.repository

import com.aidebatepartner.app.data.local.TokenDataStore
import com.aidebatepartner.app.data.model.*
import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.domain.model.Achievement
import com.aidebatepartner.app.domain.model.User
import com.aidebatepartner.app.domain.repository.AuthRepository
import com.aidebatepartner.app.utils.Resource
import com.aidebatepartner.app.utils.safeApiCall
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val api: ApiService,
    private val tokenDataStore: TokenDataStore,
    private val gson: Gson
) : AuthRepository {

    override suspend fun login(email: String, password: String): Resource<Pair<User, String>> {
        val result = safeApiCall { api.login(LoginRequest(email, password)) }
        return when (result) {
            is Resource.Success -> {
                val token = result.data.token ?: return Resource.Error("No token received")
                val userDto = result.data.user ?: return Resource.Error("No user data received")
                val user = userDto.toDomain()
                saveSession(user, token)
                Resource.Success(Pair(user, token))
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun register(
        username: String, email: String, password: String, difficultyLevel: String
    ): Resource<Pair<User, String>> {
        val result = safeApiCall {
            api.register(RegisterRequest(username, email, password, difficultyLevel))
        }
        return when (result) {
            is Resource.Success -> {
                val token = result.data.token ?: return Resource.Error("No token received")
                val userDto = result.data.user ?: return Resource.Error("No user data received")
                val user = userDto.toDomain()
                saveSession(user, token)
                Resource.Success(Pair(user, token))
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun logout(): Resource<Unit> {
        safeApiCall { api.logout() }
        clearSession()
        return Resource.Success(Unit)
    }

    override suspend fun getMe(): Resource<User> {
        val result = safeApiCall { api.getMe() }
        return when (result) {
            is Resource.Success -> {
                val userDto = result.data.user ?: return Resource.Error("No user data")
                val user = userDto.toDomain()
                tokenDataStore.saveUserJson(gson.toJson(userDto))
                Resource.Success(user)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun updateProfile(
        username: String?, bio: String?, difficultyLevel: String?
    ): Resource<User> {
        val result = safeApiCall {
            api.updateProfile(UpdateProfileRequest(username, bio, difficultyLevel, null))
        }
        return when (result) {
            is Resource.Success -> {
                val userDto = result.data.user ?: return Resource.Error("No user data")
                val user = userDto.toDomain()
                tokenDataStore.saveUserJson(gson.toJson(userDto))
                Resource.Success(user)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun forgotPassword(email: String): Resource<String> {
        val result = safeApiCall { api.forgotPassword(ForgotPasswordRequest(email)) }
        return when (result) {
            is Resource.Success -> Resource.Success(result.data.message ?: "Email sent")
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override fun isLoggedIn(): Flow<Boolean> = tokenDataStore.isLoggedIn()

    override fun getSavedUser(): Flow<User?> = tokenDataStore.getUserJson().map { json ->
        if (json.isNullOrBlank()) null
        else try {
            gson.fromJson(json, UserDto::class.java)?.toDomain()
        } catch (e: Exception) { null }
    }

    override suspend fun saveSession(user: User, token: String) {
        tokenDataStore.saveToken(token)
        tokenDataStore.saveUserJson(gson.toJson(user.toDto()))
    }

    override suspend fun clearSession() {
        tokenDataStore.clearAll()
    }

    private fun UserDto.toDomain() = User(
        id = id,
        username = username,
        email = email,
        avatar = avatar,
        bio = bio,
        xp = xp,
        level = level,
        tier = tier,
        streak = streak,
        longestStreak = longestStreak,
        plan = plan,
        role = role,
        difficultyLevel = difficultyLevel,
        totalDebates = totalDebates,
        debatesWon = debatesWon,
        logicScore = logicScore,
        totalFallaciesDetected = totalFallaciesDetected,
        achievements = achievements?.map {
            Achievement(it.id, it.name, it.description, it.icon, it.unlockedAt)
        } ?: emptyList(),
        preferredTopics = preferredTopics ?: emptyList()
    )

    private fun User.toDto() = UserDto(
        id = id, username = username, email = email, avatar = avatar, bio = bio,
        xp = xp, level = level, tier = tier, streak = streak, longestStreak = longestStreak,
        plan = plan, role = role, difficultyLevel = difficultyLevel,
        totalDebates = totalDebates, debatesWon = debatesWon, logicScore = logicScore,
        totalFallaciesDetected = totalFallaciesDetected
    )
}
