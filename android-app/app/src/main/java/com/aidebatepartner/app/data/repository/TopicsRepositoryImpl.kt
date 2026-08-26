package com.aidebatepartner.app.data.repository

import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.domain.model.Topic
import com.aidebatepartner.app.domain.repository.TopicsRepository
import com.aidebatepartner.app.utils.Resource
import com.aidebatepartner.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TopicsRepositoryImpl @Inject constructor(
    private val api: ApiService
) : TopicsRepository {

    override suspend fun getTopics(
        category: String?, difficulty: String?, search: String?
    ): Resource<List<Topic>> {
        val result = safeApiCall { api.getTopics(category, difficulty, search) }
        return when (result) {
            is Resource.Success -> {
                val topics = result.data.topics?.map { dto ->
                    Topic(
                        id = dto.id, title = dto.title, category = dto.category,
                        difficulty = dto.difficulty, icon = dto.icon,
                        tags = dto.tags, debateCount = dto.debateCount
                    )
                } ?: emptyList()
                Resource.Success(topics)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }
}
