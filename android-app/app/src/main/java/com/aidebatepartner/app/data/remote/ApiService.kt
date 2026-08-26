package com.aidebatepartner.app.data.remote

import com.aidebatepartner.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ─── Auth ───────────────────────────────────────────────────────────────
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<GenericResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<AuthResponse>

    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<GenericResponse>

    // ─── Debates ────────────────────────────────────────────────────────────
    @POST("debates/start")
    suspend fun startDebate(@Body request: StartDebateRequest): Response<StartDebateResponse>

    @POST("debates/message")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<SendMessageResponse>

    @POST("debates/end")
    suspend fun endDebate(@Body request: Map<String, String>): Response<EndDebateResponse>

    @GET("debates/history")
    suspend fun getDebateHistory(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): Response<DebateHistoryResponse>

    @GET("debates/{id}")
    suspend fun getDebate(@Path("id") id: String): Response<SingleDebateResponse>

    // ─── Fallacies ──────────────────────────────────────────────────────────
    @POST("fallacies/analyze")
    suspend fun analyzeFallacies(@Body request: AnalyzeTextRequest): Response<AnalyzeTextResponse>

    @GET("fallacies/library")
    suspend fun getFallacyLibrary(): Response<FallacyLibraryResponse>

    // ─── Analytics ──────────────────────────────────────────────────────────
    @GET("analytics/user")
    suspend fun getUserAnalytics(): Response<AnalyticsResponse>

    // ─── Topics ─────────────────────────────────────────────────────────────
    @GET("topics")
    suspend fun getTopics(
        @Query("category") category: String? = null,
        @Query("difficulty") difficulty: String? = null,
        @Query("search") search: String? = null
    ): Response<TopicsResponse>
}
