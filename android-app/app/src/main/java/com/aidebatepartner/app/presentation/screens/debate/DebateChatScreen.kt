package com.aidebatepartner.app.presentation.screens.debate

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.DebateViewModel
import com.aidebatepartner.app.utils.*

@Composable
fun DebateChatScreen(
    viewModel: DebateViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    var showFallacySheet by remember { mutableStateOf(false) }

    // Auto-scroll to bottom on new messages
    LaunchedEffect(state.messages.size, state.isTyping) {
        if (state.messages.isNotEmpty()) {
            listState.animateScrollToItem(state.messages.size - 1)
        }
    }

    // Show summary when debate ends
    if (state.showSummary && state.summary != null) {
        DebateSummaryScreen(
            summary = state.summary!!,
            onNewDebate = { viewModel.resetDebate() },
            onBack = onBack
        )
        return
    }

    Scaffold(
        containerColor = DarkBg,
        topBar = {
            DebateChatTopBar(
                topic = state.currentDebate?.topic ?: "",
                difficulty = state.currentDebate?.difficulty ?: "intermediate",
                turnCount = state.turnCount,
                isPaused = state.isPaused,
                isLoading = state.isLoading,
                onPause = { viewModel.togglePause() },
                onEnd = { viewModel.endDebate() },
                onBack = onBack
            )
        },
        bottomBar = {
            DebateInputBar(
                value = inputText,
                onValueChange = { inputText = it },
                onSend = {
                    if (inputText.isNotBlank()) {
                        viewModel.sendMessage(inputText.trim())
                        inputText = ""
                    }
                },
                isTyping = state.isTyping,
                isPaused = state.isPaused,
                fallacyCount = state.messages.count { it.hasFallacy }
            )
        }
    ) { padding ->
        GradientBackground {
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                // Error banner
                AnimatedVisibility(visible = state.error != null) {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(Error.copy(0.15f))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(state.error ?: "", color = Error, style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f))
                            IconButton(onClick = { viewModel.clearError() }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Close, null, tint = Error, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                // Paused banner
                AnimatedVisibility(visible = state.isPaused) {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(Warning.copy(0.15f))
                            .padding(10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Pause, null, tint = Warning, modifier = Modifier.size(16.dp))
                            Text("Debate paused — tap play to resume", color = Warning, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }

                // Messages
                LazyColumn(
                    state = listState,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(state.messages, key = { it.id }) { message ->
                        MessageBubble(
                            message = message,
                            onFallacyClick = { viewModel.setActiveFallacy(it) }
                        )
                    }

                    // Typing indicator
                    if (state.isTyping) {
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(start = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier.size(28.dp)
                                        .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) { Text("🧠", fontSize = 14.sp) }
                                Box(
                                    modifier = Modifier
                                        .background(GlassBg, RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                                        .border(1.dp, GlassBorder, RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                                ) {
                                    TypingIndicator()
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Fallacy detail bottom sheet
    if (state.activeFallacy != null) {
        FallacyDetailSheet(
            fallacy = state.activeFallacy!!,
            onDismiss = { viewModel.setActiveFallacy(null) }
        )
    }
}

@Composable
private fun MessageBubble(
    message: DebateMessage,
    onFallacyClick: (Fallacy) -> Unit
) {
    val isUser = message.sender == "user"

    AnimatedVisibility(
        visible = true,
        enter = fadeIn(tween(300)) + slideInVertically(tween(300)) { it / 2 }
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
        ) {
            // AI label
            if (!isUser) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(start = 8.dp, bottom = 4.dp)
                ) {
                    Box(
                        modifier = Modifier.size(22.dp)
                            .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                        contentAlignment = Alignment.Center
                    ) { Text("🧠", fontSize = 11.sp) }
                    Text("Aria — AI Coach", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                }
            }

            // Bubble
            Box(
                modifier = Modifier
                    .widthIn(max = 300.dp)
                    .background(
                        if (isUser) PrimaryBlue.copy(0.25f) else GlassBg,
                        if (isUser) RoundedCornerShape(16.dp, 4.dp, 16.dp, 16.dp)
                        else RoundedCornerShape(4.dp, 16.dp, 16.dp, 16.dp)
                    )
                    .border(
                        1.dp,
                        if (isUser) PrimaryBlue.copy(0.3f) else GlassBorder,
                        if (isUser) RoundedCornerShape(16.dp, 4.dp, 16.dp, 16.dp)
                        else RoundedCornerShape(4.dp, 16.dp, 16.dp, 16.dp)
                    )
                    .padding(12.dp)
            ) {
                Text(
                    text = message.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary,
                    lineHeight = 22.sp
                )
            }

            // Fallacy badges
            if (message.hasFallacy && message.fallacies.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(horizontal = 4.dp)
                ) {
                    message.fallacies.take(2).forEach { fallacy ->
                        val color = fallacy.type.toFallacyColor()
                        FallacyBadge(
                            name = fallacy.name,
                            confidence = fallacy.confidence,
                            color = color,
                            onClick = { onFallacyClick(fallacy) }
                        )
                    }
                }
            }

            // Scores for user messages
            if (isUser && (message.logicScore != null || message.confidenceScore != null)) {
                Spacer(Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.padding(end = 4.dp)
                ) {
                    message.logicScore?.let { score ->
                        Text(
                            "Logic: ${score}%",
                            style = MaterialTheme.typography.labelSmall,
                            color = score.toScoreColor()
                        )
                    }
                    message.confidenceScore?.let { score ->
                        Text(
                            "Confidence: ${score}%",
                            style = MaterialTheme.typography.labelSmall,
                            color = score.toScoreColor()
                        )
                    }
                }
            }

            // Timestamp
            Text(
                message.timestamp.formatTimestamp(),
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DebateChatTopBar(
    topic: String,
    difficulty: String,
    turnCount: Int,
    isPaused: Boolean,
    isLoading: Boolean,
    onPause: () -> Unit,
    onEnd: () -> Unit,
    onBack: () -> Unit
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    topic,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    AppChip(difficulty.replaceFirstChar { it.uppercase() }, difficulty.toDifficultyColor())
                    Text("Turn $turnCount", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Box(
                            modifier = Modifier.size(6.dp)
                                .background(if (isPaused) Warning else Success, CircleShape)
                        )
                        Text(if (isPaused) "Paused" else "Live", style = MaterialTheme.typography.labelSmall, color = if (isPaused) Warning else Success)
                    }
                }
            }
        },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, null, tint = TextPrimary)
            }
        },
        actions = {
            IconButton(onClick = onPause) {
                Icon(
                    if (isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                    null, tint = TextSecondary
                )
            }
            if (isLoading) {
                Box(modifier = Modifier.padding(end = 8.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = PrimaryBlue, strokeWidth = 2.dp)
                }
            } else {
                TextButton(
                    onClick = onEnd,
                    colors = ButtonDefaults.textButtonColors(contentColor = Error)
                ) {
                    Icon(Icons.Default.Stop, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("End", style = MaterialTheme.typography.labelMedium)
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkSurface.copy(0.95f))
    )
}

@Composable
private fun DebateInputBar(
    value: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    isTyping: Boolean,
    isPaused: Boolean,
    fallacyCount: Int
) {
    Column(
        modifier = Modifier
            .background(DarkSurface.copy(0.95f))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier.weight(1f),
                placeholder = {
                    Text(
                        if (isPaused) "Debate is paused..." else "Type your argument...",
                        color = TextMuted,
                        style = MaterialTheme.typography.bodySmall
                    )
                },
                enabled = !isPaused && !isTyping,
                maxLines = 4,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = GlassBorder,
                    focusedContainerColor = GlassBg,
                    unfocusedContainerColor = GlassBg,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    disabledContainerColor = GlassBg.copy(0.5f),
                    disabledBorderColor = GlassBorder.copy(0.5f),
                    cursorColor = PrimaryBlue
                ),
                textStyle = MaterialTheme.typography.bodyMedium
            )

            // Send button
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        if (value.isNotBlank() && !isPaused && !isTyping) PrimaryBlue else GlassBg,
                        CircleShape
                    )
                    .clickable(enabled = value.isNotBlank() && !isPaused && !isTyping) { onSend() },
                contentAlignment = Alignment.Center
            ) {
                if (isTyping) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = PrimaryBlue400, strokeWidth = 2.dp)
                } else {
                    Icon(
                        Icons.Default.Send,
                        null,
                        tint = if (value.isNotBlank() && !isPaused) androidx.compose.ui.graphics.Color.White else TextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // Footer info
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp, start = 4.dp, end = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                "Fallacies detected: $fallacyCount",
                style = MaterialTheme.typography.labelSmall,
                color = if (fallacyCount > 0) Warning else TextMuted
            )
            Text(
                "${value.length}/1000",
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FallacyDetailSheet(fallacy: Fallacy, onDismiss: () -> Unit) {
    val color = fallacy.type.toFallacyColor()
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        dragHandle = {
            Box(
                modifier = Modifier.padding(top = 12.dp, bottom = 8.dp)
                    .width(40.dp).height(4.dp)
                    .background(GlassBorder, RoundedCornerShape(2.dp))
            )
        }
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier.size(44.dp)
                        .background(color.copy(0.2f), RoundedCornerShape(12.dp))
                        .border(1.dp, color.copy(0.4f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) { Text("⚠️", fontSize = 22.sp) }
                Column {
                    Text(fallacy.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = color)
                    Text("Logical Fallacy Detected", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                }
            }

            Text(fallacy.description, style = MaterialTheme.typography.bodyMedium, color = TextSecondary, lineHeight = 22.sp)

            // Confidence
            Column {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Detection Confidence", style = MaterialTheme.typography.labelMedium, color = TextSecondary)
                    Text("${(fallacy.confidence * 100).toInt()}%", style = MaterialTheme.typography.labelMedium, color = color, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(6.dp))
                ScoreBar(score = (fallacy.confidence * 100).toInt(), color = color)
            }

            if (fallacy.highlightedText != null) {
                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(color.copy(0.1f), RoundedCornerShape(10.dp))
                        .border(1.dp, color.copy(0.3f), RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Column {
                        Text("Detected in:", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                        Spacer(Modifier.height(4.dp))
                        Text("\"${fallacy.highlightedText}\"", style = MaterialTheme.typography.bodySmall, color = color, fontWeight = FontWeight.Medium)
                    }
                }
            }

            PrimaryButton("Got it", onDismiss, modifier = Modifier.fillMaxWidth())
        }
    }
}
