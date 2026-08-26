package com.aidebatepartner.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.domain.repository.DebateRepository
import com.aidebatepartner.app.domain.repository.TopicsRepository
import com.aidebatepartner.app.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DebateUiState(
    val isLoading: Boolean = false,
    val isSetupMode: Boolean = true,
    val currentDebate: Debate? = null,
    val messages: List<DebateMessage> = emptyList(),
    val isTyping: Boolean = false,
    val isPaused: Boolean = false,
    val activeFallacy: Fallacy? = null,
    val summary: DebateSummary? = null,
    val showSummary: Boolean = false,
    val error: String? = null,
    val turnCount: Int = 0,
    // Setup fields
    val topic: String = "",
    val difficulty: String = "intermediate",
    val aiPersonality: String = "logical",
    val userPosition: String = "",
    // History
    val history: List<Debate> = emptyList(),
    val historyLoading: Boolean = false,
    // Topics
    val topics: List<Topic> = emptyList(),
    val topicsLoading: Boolean = false
)

@HiltViewModel
class DebateViewModel @Inject constructor(
    private val debateRepository: DebateRepository,
    private val topicsRepository: TopicsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DebateUiState())
    val uiState: StateFlow<DebateUiState> = _uiState.asStateFlow()

    fun setTopic(topic: String) = _uiState.update { it.copy(topic = topic) }
    fun setDifficulty(d: String) = _uiState.update { it.copy(difficulty = d) }
    fun setAiPersonality(p: String) = _uiState.update { it.copy(aiPersonality = p) }
    fun setUserPosition(pos: String) = _uiState.update { it.copy(userPosition = pos) }
    fun setActiveFallacy(f: Fallacy?) = _uiState.update { it.copy(activeFallacy = f) }
    fun clearError() = _uiState.update { it.copy(error = null) }

    fun startDebate() {
        val state = _uiState.value
        if (state.topic.isBlank()) {
            _uiState.update { it.copy(error = "Please enter a debate topic") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = debateRepository.startDebate(
                state.topic, state.difficulty, state.aiPersonality,
                state.userPosition.ifBlank { null }
            )) {
                is Resource.Success -> {
                    val (debate, openingMsg) = result.data
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isSetupMode = false,
                            currentDebate = debate,
                            messages = listOf(openingMsg),
                            turnCount = 1
                        )
                    }
                }
                is Resource.Error -> _uiState.update {
                    it.copy(isLoading = false, error = result.message)
                }
                is Resource.Loading -> {}
            }
        }
    }

    fun sendMessage(content: String) {
        val state = _uiState.value
        if (content.isBlank() || state.currentDebate == null || state.isPaused) return

        val tempId = "temp-${System.currentTimeMillis()}"
        val tempMsg = DebateMessage(
            id = tempId, sender = "user", content = content,
            timestamp = System.currentTimeMillis().toString()
        )

        _uiState.update {
            it.copy(
                messages = it.messages + tempMsg,
                isTyping = true,
                error = null
            )
        }

        viewModelScope.launch {
            when (val result = debateRepository.sendMessage(state.currentDebate.id, content)) {
                is Resource.Success -> {
                    val (userMsg, aiMsg) = result.data
                    _uiState.update { s ->
                        s.copy(
                            messages = s.messages.filter { it.id != tempId } + userMsg + aiMsg,
                            isTyping = false,
                            turnCount = s.turnCount + 1
                        )
                    }
                }
                is Resource.Error -> {
                    _uiState.update { s ->
                        s.copy(
                            messages = s.messages.filter { it.id != tempId },
                            isTyping = false,
                            error = result.message
                        )
                    }
                }
                is Resource.Loading -> {}
            }
        }
    }

    fun endDebate() {
        val debateId = _uiState.value.currentDebate?.id ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            when (val result = debateRepository.endDebate(debateId)) {
                is Resource.Success -> _uiState.update {
                    it.copy(isLoading = false, summary = result.data, showSummary = true)
                }
                is Resource.Error -> _uiState.update {
                    it.copy(isLoading = false, error = result.message)
                }
                is Resource.Loading -> {}
            }
        }
    }

    fun togglePause() = _uiState.update { it.copy(isPaused = !it.isPaused) }

    fun resetDebate() {
        _uiState.update {
            it.copy(
                isSetupMode = true, currentDebate = null, messages = emptyList(),
                isTyping = false, isPaused = false, activeFallacy = null,
                summary = null, showSummary = false, turnCount = 0,
                topic = "", userPosition = ""
            )
        }
    }

    fun loadHistory() {
        viewModelScope.launch {
            _uiState.update { it.copy(historyLoading = true) }
            when (val result = debateRepository.getHistory(1, 20)) {
                is Resource.Success -> _uiState.update {
                    it.copy(historyLoading = false, history = result.data)
                }
                is Resource.Error -> _uiState.update {
                    it.copy(historyLoading = false, error = result.message)
                }
                is Resource.Loading -> {}
            }
        }
    }

    fun loadTopics() {
        viewModelScope.launch {
            _uiState.update { it.copy(topicsLoading = true) }
            when (val result = topicsRepository.getTopics()) {
                is Resource.Success -> _uiState.update {
                    it.copy(topicsLoading = false, topics = result.data)
                }
                is Resource.Error -> _uiState.update {
                    it.copy(topicsLoading = false, topics = emptyList())
                }
                is Resource.Loading -> {}
            }
        }
    }
}
