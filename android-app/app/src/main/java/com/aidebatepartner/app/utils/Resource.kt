package com.aidebatepartner.app.utils

sealed class Resource<out T> {
    data class Success<T>(val data: T) : Resource<T>()
    data class Error(val message: String, val code: Int? = null) : Resource<Nothing>()
    object Loading : Resource<Nothing>()

    val isLoading get() = this is Loading
    val isSuccess get() = this is Success
    val isError get() = this is Error

    fun getOrNull(): T? = if (this is Success) data else null
    fun errorMessage(): String? = if (this is Error) message else null
}

suspend fun <T> safeApiCall(call: suspend () -> retrofit2.Response<T>): Resource<T> {
    return try {
        val response = call()
        if (response.isSuccessful) {
            val body = response.body()
            if (body != null) {
                Resource.Success(body)
            } else {
                Resource.Error("Empty response body")
            }
        } else {
            val errorBody = response.errorBody()?.string()
            val message = try {
                val json = com.google.gson.JsonParser.parseString(errorBody).asJsonObject
                json.get("error")?.asString ?: "Request failed (${response.code()})"
            } catch (e: Exception) {
                "Request failed (${response.code()})"
            }
            Resource.Error(message, response.code())
        }
    } catch (e: java.net.ConnectException) {
        Resource.Error("Cannot connect to server. Make sure the backend is running.")
    } catch (e: java.net.SocketTimeoutException) {
        Resource.Error("Request timed out. Please try again.")
    } catch (e: Exception) {
        Resource.Error(e.message ?: "An unexpected error occurred")
    }
}
