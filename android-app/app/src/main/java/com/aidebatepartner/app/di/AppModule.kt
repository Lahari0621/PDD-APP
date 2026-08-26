package com.aidebatepartner.app.di

import com.aidebatepartner.app.BuildConfig
import com.aidebatepartner.app.data.local.TokenDataStore
import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.data.remote.AuthInterceptor
import com.aidebatepartner.app.data.repository.*
import com.aidebatepartner.app.domain.repository.*
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder().setLenient().create()

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
            else HttpLoggingInterceptor.Level.NONE
        }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)

    @Provides
    @Singleton
    fun provideAuthRepository(
        api: ApiService,
        tokenDataStore: TokenDataStore,
        gson: Gson
    ): AuthRepository = AuthRepositoryImpl(api, tokenDataStore, gson)

    @Provides
    @Singleton
    fun provideDebateRepository(api: ApiService): DebateRepository =
        DebateRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideFallacyRepository(api: ApiService): FallacyRepository =
        FallacyRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideAnalyticsRepository(api: ApiService): AnalyticsRepository =
        AnalyticsRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideTopicsRepository(api: ApiService): TopicsRepository =
        TopicsRepositoryImpl(api)
}
