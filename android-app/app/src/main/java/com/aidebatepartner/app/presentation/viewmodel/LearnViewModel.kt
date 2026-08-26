package com.aidebatepartner.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidebatepartner.app.data.model.FallacyAnalysisDto
import com.aidebatepartner.app.domain.model.FallacyLibraryItem
import com.aidebatepartner.app.domain.repository.FallacyRepository
import com.aidebatepartner.app.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LearnUiState(
    val isLoading: Boolean = false,
    val fallacyLibrary: List<FallacyLibraryItem> = emptyList(),
    val selectedFallacy: FallacyLibraryItem? = null,
    val searchQuery: String = "",
    val activeTab: LearnTab = LearnTab.LIBRARY,
    val analyzeText: String = "",
    val analysisResult: FallacyAnalysisDto? = null,
    val isAnalyzing: Boolean = false,
    val error: String? = null,
    // Quiz state
    val quizCurrentQuestion: Int = 0,
    val quizSelected: Int? = null,
    val quizScore: Int = 0,
    val quizCompleted: Boolean = false,
    val quizShowExplanation: Boolean = false,
    // Flashcard state
    val flashcardIndex: Int = 0,
    val flashcardFlipped: Boolean = false
)

enum class LearnTab { LIBRARY, FLASHCARDS, QUIZ, ANALYZER }

@HiltViewModel
class LearnViewModel @Inject constructor(
    private val fallacyRepository: FallacyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LearnUiState())
    val uiState: StateFlow<LearnUiState> = _uiState.asStateFlow()

    val filteredFallacies: StateFlow<List<FallacyLibraryItem>> = _uiState
        .map { state ->
            if (state.searchQuery.isBlank()) state.fallacyLibrary
            else state.fallacyLibrary.filter { f ->
                f.name.contains(state.searchQuery, ignoreCase = true) ||
                f.description.contains(state.searchQuery, ignoreCase = true)
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init { loadLibrary() }

    fun loadLibrary() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            when (val result = fallacyRepository.getLibrary()) {
                is Resource.Success -> _uiState.update {
                    it.copy(isLoading = false, fallacyLibrary = result.data)
                }
                is Resource.Error -> _uiState.update {
                    it.copy(isLoading = false, error = result.message)
                }
                is Resource.Loading -> {}
            }
        }
    }

    fun setTab(tab: LearnTab) = _uiState.update { it.copy(activeTab = tab) }
    fun setSearch(q: String) = _uiState.update { it.copy(searchQuery = q) }
    fun selectFallacy(f: FallacyLibraryItem?) = _uiState.update { it.copy(selectedFallacy = f) }
    fun setAnalyzeText(t: String) = _uiState.update { it.copy(analyzeText = t) }

    fun analyzeText() {
        val text = _uiState.value.analyzeText
        if (text.isBlank()) return
        viewModelScope.launch {
            _uiState.update { it.copy(isAnalyzing = true, analysisResult = null) }
            when (val result = fallacyRepository.analyzeText(text)) {
                is Resource.Success -> _uiState.update {
                    it.copy(isAnalyzing = false, analysisResult = result.data)
                }
                is Resource.Error -> _uiState.update {
                    it.copy(isAnalyzing = false, error = result.message)
                }
                is Resource.Loading -> {}
            }
        }
    }

    // Quiz
    fun answerQuiz(index: Int, correct: Int) {
        if (_uiState.value.quizSelected != null) return
        _uiState.update {
            it.copy(
                quizSelected = index,
                quizShowExplanation = true,
                quizScore = if (index == correct) it.quizScore + 1 else it.quizScore
            )
        }
    }

    fun nextQuestion(totalQuestions: Int) {
        val current = _uiState.value.quizCurrentQuestion
        if (current < totalQuestions - 1) {
            _uiState.update {
                it.copy(quizCurrentQuestion = current + 1, quizSelected = null, quizShowExplanation = false)
            }
        } else {
            _uiState.update { it.copy(quizCompleted = true) }
        }
    }

    fun resetQuiz() = _uiState.update {
        it.copy(quizCurrentQuestion = 0, quizSelected = null, quizScore = 0, quizCompleted = false, quizShowExplanation = false)
    }

    // Flashcard
    fun flipCard() = _uiState.update { it.copy(flashcardFlipped = !it.flashcardFlipped) }
    fun nextCard(total: Int) = _uiState.update {
        it.copy(flashcardIndex = (it.flashcardIndex + 1) % total, flashcardFlipped = false)
    }
    fun prevCard(total: Int) = _uiState.update {
        it.copy(flashcardIndex = (it.flashcardIndex - 1 + total) % total, flashcardFlipped = false)
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}
