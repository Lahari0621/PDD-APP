package com.aidebatepartner.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

@Singleton
class TokenDataStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USERNAME_KEY = stringPreferencesKey("username")
        private val EMAIL_KEY = stringPreferencesKey("email")
        private val USER_JSON_KEY = stringPreferencesKey("user_json")
    }

    fun getToken(): Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }

    fun getUserJson(): Flow<String?> = context.dataStore.data.map { it[USER_JSON_KEY] }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[TOKEN_KEY] = token }
    }

    suspend fun saveUserJson(userJson: String) {
        context.dataStore.edit { it[USER_JSON_KEY] = userJson }
    }

    suspend fun saveUserId(userId: String) {
        context.dataStore.edit { it[USER_ID_KEY] = userId }
    }

    suspend fun saveUsername(username: String) {
        context.dataStore.edit { it[USERNAME_KEY] = username }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }

    fun isLoggedIn(): Flow<Boolean> = context.dataStore.data.map {
        !it[TOKEN_KEY].isNullOrBlank()
    }
}
