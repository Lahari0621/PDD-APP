package com.aidebatepartner.app.presentation.screens.learn

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import androidx.hilt.navigation.compose.hiltViewModel
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.*
import com.aidebatepartner.app.utils.toFallacyColor

private val QUIZ_QUESTIONS = listOf(
    QuizQuestion(1, "Which fallacy involves attacking the person rather than their argument?",
        listOf("Straw Man", "Ad Hominem", "Slippery Slope", "Bandwagon"), 1,
        "Ad Hominem attacks the person making the argument rather than addressing the argument itself."),
    QuizQuestion(2, "What is a False Dilemma?",
        listOf("Presenting only two options when more exist", "Using emotions to persuade", "Generalizing from few examples", "Attacking the person"), 0,
        "A False Dilemma presents only two choices when in reality more options exist."),
    QuizQuestion(3, "Which fallacy assumes one event will lead to extreme consequences?",
        listOf("Bandwagon", "Ad Hominem", "Slippery Slope", "Red Herring"), 2,
        "The Slippery Slope fallacy assumes that one event will inevitably lead to extreme consequences without evidence."),
    QuizQuestion(4, "Everyone is doing it, so it must be right is an example of:",
        listOf("Appeal to Authority", "Bandwagon", "Hasty Generalization", "Circular Reasoning"), 1,
        "The Bandwagon fallacy argues something is true or good because many people believe or do it."),
    QuizQuestion(5, "Drawing broad conclusions from a small sample is called:",
        listOf("False Dilemma", "Straw Man", "Hasty Generalization", "Appeal to Emotion"), 2,
        "Hasty Generalization involves drawing broad conclusions from insufficient or unrepresentative evidence.")
)

private val FLASHCARDS = listOf(
    FlashCard("Ad Hominem", "Attacking the person making the argument rather than the argument itself.", "#EF4444", "person"),
    FlashCard("Straw Man", "Misrepresenting someone's argument to make it easier to attack.", "#F59E0B", "theater"),
    FlashCard("Slippery Slope", "Assuming one event will inevitably lead to extreme consequences without justification.", "#8B5CF6", "trending_down"),
    FlashCard("Appeal to Emotion", "Manipulating emotions rather than using logical reasoning to support a claim.", "#EC4899", "favorite"),
    FlashCard("False Dilemma", "Presenting only two options when more alternatives exist.", "#06B6D4", "balance"),
    FlashCard("Bandwagon", "Arguing something is true or good because many people believe it.", "#10B981", "group")
)

@Composable
fun LearnScreen(
    onBack: () -> Unit,
    viewModel: LearnViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val filtered by viewModel.filteredFallacies.collectAsState()

    Scaffold(
        containerColor = DarkBg,
        topBar = { AppTopBar(title = "Learning Hub", onBack = onBack) }
    ) { padding ->
        GradientBackground {
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                // Tab row
                ScrollableTabRow(
                    selectedTabIndex = state.activeTab.ordinal,
                    containerColor = DarkSurface,
                    contentColor = PrimaryBlue400,
                    edgePadding = 16.dp,
                    indicator = { tabPositions ->
                        if (state.activeTab.ordinal < tabPositions.size) {
                            TabRowDefaults.SecondaryIndicator(
                                modifier = Modifier.tabIndicatorOffset(tabPositions[state.activeTab.ordinal]),
                                color = PrimaryBlue
                            )
                        }
                    }
                ) {
                    LearnTab.values().forEach { tab ->
                        Tab(
                            selected = state.activeTab == tab,
                            onClick = { viewModel.setTab(tab) },
                            text = {
                                Text(
                                    when (tab) {
                                        LearnTab.LIBRARY -> "Library"
                                        LearnTab.FLASHCARDS -> "Flashcards"
                                        LearnTab.QUIZ -> "Quiz"
                                        LearnTab.ANALYZER -> "Analyzer"
                                    },
                                    style = MaterialTheme.typography.labelMedium
                                )
                            }
                        )
                    }
                }

                when (state.activeTab) {
                    LearnTab.LIBRARY -> FallacyLibraryTab(
                        fallacies = filtered,
                        isLoading = state.isLoading,
                        searchQuery = state.searchQuery,
                        onSearch = viewModel::setSearch,
                        onSelect = viewModel::selectFallacy
                    )
                    LearnTab.FLASHCARDS -> FlashcardsTab(
                        cards = FLASHCARDS,
                        currentIndex = state.flashcardIndex,
                        isFlipped = state.flashcardFlipped,
                        onFlip = viewModel::flipCard,
                        onNext = { viewModel.nextCard(FLASHCARDS.size) },
                        onPrev = { viewModel.prevCard(FLASHCARDS.size) }
                    )
                    LearnTab.QUIZ -> QuizTab(
                        questions = QUIZ_QUESTIONS,
                        currentQuestion = state.quizCurrentQuestion,
                        selected = state.quizSelected,
                        score = state.quizScore,
                        completed = state.quizCompleted,
                        showExplanation = state.quizShowExplanation,
                        onAnswer = { idx -> viewModel.answerQuiz(idx, QUIZ_QUESTIONS[state.quizCurrentQuestion].correct) },
                        onNext = { viewModel.nextQuestion(QUIZ_QUESTIONS.size) },
                        onReset = viewModel::resetQuiz
                    )
                    LearnTab.ANALYZER -> AnalyzerTab(
                        text = state.analyzeText,
                        onTextChange = viewModel::setAnalyzeText,
                        onAnalyze = viewModel::analyzeText,
                        isAnalyzing = state.isAnalyzing,
                        result = state.analysisResult
                    )
                }
            }
        }
    }

    // Fallacy detail dialog
    if (state.selectedFallacy != null) {
        FallacyDetailDialog(
            item = state.selectedFallacy!!,
            onDismiss = { viewModel.selectFallacy(null) }
        )
    }
}

@Composable
private fun FallacyLibraryTab(
    fallacies: List<FallacyLibraryItem>,
    isLoading: Boolean,
    searchQuery: String,
    onSearch: (String) -> Unit,
    onSelect: (FallacyLibraryItem) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearch,
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            placeholder = { Text("Search fallacies...", color = TextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, null, tint = TextMuted) },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PrimaryBlue,
                unfocusedBorderColor = GlassBorder,
                focusedContainerColor = GlassBg,
                unfocusedContainerColor = GlassBg,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                cursorColor = PrimaryBlue
            )
        )

        if (isLoading) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(6) { ShimmerBox(modifier = Modifier.fillMaxWidth().height(120.dp)) }
            }
        } else if (fallacies.isEmpty()) {
            EmptyState("🔍", "No fallacies found", "Try a different search term", modifier = Modifier.fillMaxSize())
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(fallacies) { item ->
                    val color = item.type.toFallacyColor()
                    GlassCard(
                        onClick = { onSelect(item) },
                        borderColor = color.copy(0.3f)
                    ) {
                        Text(item.icon, fontSize = 28.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(item.name, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = color)
                        Spacer(Modifier.height(4.dp))
                        Text(item.shortDescription, style = MaterialTheme.typography.labelSmall, color = TextSecondary, maxLines = 2)
                        Spacer(Modifier.height(8.dp))
                        AppChip(item.severity.replaceFirstChar { it.uppercase() }, color)
                    }
                }
            }
        }
    }
}

@Composable
private fun FlashcardsTab(
    cards: List<FlashCard>,
    currentIndex: Int,
    isFlipped: Boolean,
    onFlip: () -> Unit,
    onNext: () -> Unit,
    onPrev: () -> Unit
) {
    val card = cards[currentIndex]
    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(500),
        label = "flip"
    )

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            "${currentIndex + 1} / ${cards.size}",
            style = MaterialTheme.typography.labelMedium,
            color = TextSecondary
        )

        // Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .graphicsLayer { rotationY = rotation; cameraDistance = 12f * density }
                .clickable { onFlip() }
        ) {
            if (rotation <= 90f) {
                // Front
                Box(
                    modifier = Modifier.fillMaxSize()
                        .background(GlassBg, RoundedCornerShape(20.dp))
                        .border(2.dp, GlassBorder, RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("📖", fontSize = 40.sp)
                        Text(card.front, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Text("Tap to reveal definition", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    }
                }
            } else {
                // Back
                Box(
                    modifier = Modifier.fillMaxSize()
                        .graphicsLayer { rotationY = 180f }
                        .background(PrimaryBlue.copy(0.15f), RoundedCornerShape(20.dp))
                        .border(2.dp, PrimaryBlue.copy(0.4f), RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        card.back,
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                        color = TextPrimary,
                        lineHeight = 26.sp,
                        modifier = Modifier.padding(20.dp)
                    )
                }
            }
        }

        // Navigation
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onPrev) {
                Icon(Icons.Default.ChevronLeft, null, tint = TextSecondary, modifier = Modifier.size(32.dp))
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Tap card to flip", style = MaterialTheme.typography.labelSmall, color = TextMuted)
            }
            IconButton(onClick = onNext) {
                Icon(Icons.Default.ChevronRight, null, tint = PrimaryBlue400, modifier = Modifier.size(32.dp))
            }
        }

        // All cards preview
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(cards.size) { i ->
                Box(
                    modifier = Modifier.size(8.dp)
                        .background(
                            if (i == currentIndex) PrimaryBlue else GlassBorder,
                            CircleShape
                        )
                )
            }
        }
    }
}

@Composable
private fun QuizTab(
    questions: List<QuizQuestion>,
    currentQuestion: Int,
    selected: Int?,
    score: Int,
    completed: Boolean,
    showExplanation: Boolean,
    onAnswer: (Int) -> Unit,
    onNext: () -> Unit,
    onReset: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        if (completed) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Spacer(Modifier.height(32.dp))
                Text(if (score >= 4) "🏆" else if (score >= 3) "🎯" else "📚", fontSize = 64.sp)
                Text("Quiz Complete!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("You scored $score/${questions.size}", style = MaterialTheme.typography.titleMedium, color = PrimaryBlue400)
                Text(
                    if (score >= 4) "Excellent! You have a strong grasp of logical fallacies."
                    else "Keep practicing to improve your fallacy detection skills.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(8.dp))
                PrimaryButton("Try Again", onReset, modifier = Modifier.fillMaxWidth())
            }
            return
        }

        val q = questions[currentQuestion]

        // Progress
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Question ${currentQuestion + 1} of ${questions.size}", style = MaterialTheme.typography.labelMedium, color = TextSecondary)
            Text("Score: $score", style = MaterialTheme.typography.labelMedium, color = PrimaryBlue400, fontWeight = FontWeight.SemiBold)
        }
        ScoreBar(score = ((currentQuestion.toFloat() / questions.size) * 100).toInt())

        // Question
        GlassCard {
            Text(q.question, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, lineHeight = 24.sp)
        }

        // Options
        q.options.forEachIndexed { idx, option ->
            val bgColor = when {
                selected == null -> GlassBg
                idx == q.correct -> Success.copy(0.15f)
                idx == selected -> Error.copy(0.15f)
                else -> GlassBg.copy(0.5f)
            }
            val borderColor = when {
                selected == null -> GlassBorder
                idx == q.correct -> Success.copy(0.5f)
                idx == selected -> Error.copy(0.5f)
                else -> GlassBorder.copy(0.3f)
            }
            Box(
                modifier = Modifier.fillMaxWidth()
                    .background(bgColor, RoundedCornerShape(12.dp))
                    .border(1.dp, borderColor, RoundedCornerShape(12.dp))
                    .clickable(enabled = selected == null) { onAnswer(idx) }
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            ('A' + idx).toString() + ".",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = when {
                                selected == null -> TextSecondary
                                idx == q.correct -> Success
                                idx == selected -> Error
                                else -> TextMuted
                            }
                        )
                        Text(option, style = MaterialTheme.typography.bodyMedium, color = if (selected != null && idx != q.correct && idx != selected) TextMuted else TextPrimary)
                    }
                    if (selected != null) {
                        when (idx) {
                            q.correct -> Text("✓", color = Success, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            selected -> Text("✗", color = Error, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                    }
                }
            }
        }

        // Explanation
        AnimatedVisibility(visible = showExplanation) {
            Box(
                modifier = Modifier.fillMaxWidth()
                    .background(
                        if (selected == q.correct) Success.copy(0.1f) else Error.copy(0.1f),
                        RoundedCornerShape(12.dp)
                    )
                    .border(1.dp, if (selected == q.correct) Success.copy(0.3f) else Error.copy(0.3f), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        if (selected == q.correct) "✓ Correct!" else "✗ Incorrect",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = if (selected == q.correct) Success else Error
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(q.explanation, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                }
            }
        }

        if (selected != null) {
            PrimaryButton(
                text = if (currentQuestion < questions.size - 1) "Next Question" else "See Results",
                onClick = onNext,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun AnalyzerTab(
    text: String,
    onTextChange: (String) -> Unit,
    onAnalyze: () -> Unit,
    isAnalyzing: Boolean,
    result: com.aidebatepartner.app.data.model.FallacyAnalysisDto?
) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Analyze any argument for logical fallacies", style = MaterialTheme.typography.bodyMedium, color = TextSecondary)

        OutlinedTextField(
            value = text,
            onValueChange = onTextChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Type an argument to analyze...", color = TextMuted) },
            minLines = 4,
            maxLines = 6,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PrimaryBlue,
                unfocusedBorderColor = GlassBorder,
                focusedContainerColor = GlassBg,
                unfocusedContainerColor = GlassBg,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                cursorColor = PrimaryBlue
            )
        )

        PrimaryButton(
            text = "Analyze Argument",
            onClick = onAnalyze,
            modifier = Modifier.fillMaxWidth(),
            isLoading = isAnalyzing,
            enabled = text.isNotBlank()
        )

        if (result != null) {
            // Score row
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier.weight(1f)
                        .background(PrimaryBlue.copy(0.1f), RoundedCornerShape(12.dp))
                        .border(1.dp, PrimaryBlue.copy(0.3f), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🎯", fontSize = 24.sp)
                        Text("${result.confidenceScore}%", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black, color = PrimaryBlue400)
                        Text("Confidence", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    }
                }
                Box(
                    modifier = Modifier.weight(1f)
                        .background((if (result.hasFallacy) Error else Success).copy(0.1f), RoundedCornerShape(12.dp))
                        .border(1.dp, (if (result.hasFallacy) Error else Success).copy(0.3f), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (result.hasFallacy) "⚠️" else "✅", fontSize = 24.sp)
                        Text("${result.fallacies?.size ?: 0}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black, color = if (result.hasFallacy) Error else Success)
                        Text("Fallacies", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    }
                }
            }

            // Fallacies list
            if (!result.fallacies.isNullOrEmpty()) {
                result.fallacies.forEach { f ->
                    val color = f.type.toFallacyColor()
                    GlassCard(borderColor = color.copy(0.3f)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                            Text(f.name, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = color)
                            AppChip("${(f.confidence * 100).toInt()}%", color)
                        }
                        Spacer(Modifier.height(6.dp))
                        Text(f.description, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                    }
                }
            } else {
                GlassCard(borderColor = Success.copy(0.3f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("✅", fontSize = 24.sp)
                        Column {
                            Text("No fallacies detected!", style = MaterialTheme.typography.labelLarge, color = Success, fontWeight = FontWeight.SemiBold)
                            Text("Your argument appears logically sound.", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        }
                    }
                }
            }

            // AI Explanation
            if (result.aiExplanation != null) {
                GlassCard(borderColor = PrimaryBlue.copy(0.3f)) {
                    Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("🧠", fontSize = 20.sp)
                        Column {
                            Text("AI Coach Feedback", style = MaterialTheme.typography.labelLarge, color = PrimaryBlue400, fontWeight = FontWeight.SemiBold)
                            Spacer(Modifier.height(4.dp))
                            Text(result.aiExplanation, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FallacyDetailDialog(item: FallacyLibraryItem, onDismiss: () -> Unit) {
    val color = item.type.toFallacyColor()
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(item.icon, fontSize = 28.sp)
                Text(item.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = color)
            }
        },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(item.description, style = MaterialTheme.typography.bodyMedium, color = TextSecondary, lineHeight = 22.sp)

                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(Error.copy(0.1f), RoundedCornerShape(10.dp))
                        .border(1.dp, Error.copy(0.3f), RoundedCornerShape(10.dp))
                        .padding(10.dp)
                ) {
                    Column {
                        Text("⚠️ Example", style = MaterialTheme.typography.labelSmall, color = Error, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(4.dp))
                        Text(item.example, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                    }
                }

                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(Success.copy(0.1f), RoundedCornerShape(10.dp))
                        .border(1.dp, Success.copy(0.3f), RoundedCornerShape(10.dp))
                        .padding(10.dp)
                ) {
                    Column {
                        Text("✅ Corrected", style = MaterialTheme.typography.labelSmall, color = Success, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(4.dp))
                        Text(item.correctedExample, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Got it", color = PrimaryBlue400) }
        }
    )
}

