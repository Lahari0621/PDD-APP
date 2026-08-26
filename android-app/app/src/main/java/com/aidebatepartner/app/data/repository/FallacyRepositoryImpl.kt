package com.aidebatepartner.app.data.repository

import com.aidebatepartner.app.data.model.AnalyzeTextRequest
import com.aidebatepartner.app.data.model.FallacyAnalysisDto
import com.aidebatepartner.app.data.remote.ApiService
import com.aidebatepartner.app.domain.model.FallacyLibraryItem
import com.aidebatepartner.app.domain.repository.FallacyRepository
import com.aidebatepartner.app.utils.Resource
import com.aidebatepartner.app.utils.safeApiCall
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FallacyRepositoryImpl @Inject constructor(
    private val api: ApiService
) : FallacyRepository {

    override suspend fun analyzeText(text: String): Resource<FallacyAnalysisDto> {
        val result = safeApiCall { api.analyzeFallacies(AnalyzeTextRequest(text)) }
        return when (result) {
            is Resource.Success -> {
                val analysis = result.data.analysis ?: return Resource.Error("No analysis data")
                Resource.Success(analysis)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }

    override suspend fun getLibrary(): Resource<List<FallacyLibraryItem>> {
        val result = safeApiCall { api.getFallacyLibrary() }
        return when (result) {
            is Resource.Success -> {
                val items = result.data.fallacies?.map { dto ->
                    FallacyLibraryItem(
                        type = dto.type, name = dto.name, category = dto.category,
                        description = dto.description, shortDescription = dto.shortDescription,
                        example = dto.example, correctedExample = dto.correctedExample,
                        severity = dto.severity, color = dto.color, icon = dto.icon,
                        tips = dto.tips ?: emptyList()
                    )
                } ?: emptyList()
                Resource.Success(items)
            }
            is Resource.Error -> result
            is Resource.Loading -> Resource.Loading
        }
    }
}
