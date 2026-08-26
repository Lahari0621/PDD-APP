package com.aidebatepartner.app.presentation.screens.history

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.hilt.navigation.compose.hiltViewModel
import com.aidebatepartner.app.domain.model.Debate
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.DebateViewModel
import com.aidebatepartner.app.utils.*

@Composable
fun HistoryScreen(
    onBack: () -> Unit,
    onStartDebate: (String) -> Unit,
    viewModel: DebateViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadHistory() }

    Scaffold(
        containerColor = DarkBg,
        topBar = {
            AppTopBar(
                title = "Debate History",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadHistory() }) {
                        Icon(Icons.Default.Refresh, null, tint = TextSecondary)
                    }
                }
            )
        }
    ) { padding ->
        GradientBackground {
            when {
                state.historyLoading -> {
                    Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryBlue)
                    }
                }
                state.history.isEmpty() -> {
                    EmptyState(
                        emoji = "💬",
                        title = "No debates yet",
                        subtitle = "Start your first debate to see your history here",
                        modifier = Modifier.fillMaxSize().padding(padding),
                        action = {
                            PrimaryButton(
                                text = "Start First Debate",
                                onClick = { onStartDebate("") },
                                modifier = Modifier.width(200.dp)
                            )
                        }
                    )
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(padding),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            // Summary stats
                            val wins = state.history.count { it.winner == "user" }
                            val draws = state.history.count { it.winner == "draw" }
                            val losses = state.history.count { it.winner == "ai" }
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                MiniStatCard("🏆 Wins", "$wins", Success, Modifier.weight(1f))
                                MiniStatCard("🤝 Draws", "$draws", Warning, Modifier.weight(1f))
                                MiniStatCard("📚 Losses", "$losses", Error, Modifier.weight(1f))
                            }
                        }

                        items(state.history, key = { it.id }) { debate ->
                            HistoryCard(
                                debate = debate,
                                onRematch = { onStartDebate(debate.topic) }
                            )
                        }

                        item { Spacer(Modifier.height(8.dp)) }
                    }
                }
            }
        }
    }
}

@Composable
private fun MiniStatCard(label: String, value: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    Box(
        modifier = modifier
            .background(color.copy(0.1f), RoundedCornerShape(12.dp))
            .border(1.dp, color.copy(0.3f), RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = color)
            Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        }
    }
}

@Composable
private fun HistoryCard(debate: Debate, onRematch: () -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val winnerEmoji = debate.winner?.toWinnerEmoji() ?: "📚"
    val winnerColor = when (debate.winner) {
        "user" -> Success
        "draw" -> Warning
        else -> Error
    }

    GlassCard(onClick = { expanded = !expanded }) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier.size(44.dp)
                        .background(winnerColor.copy(0.15f), RoundedCornerShape(12.dp))
                        .border(1.dp, winnerColor.copy(0.3f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) { Text(winnerEmoji, fontSize = 22.sp) }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        debate.topic,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = if (expanded) Int.MAX_VALUE else 1,
                        overflow = if (expanded) androidx.compose.ui.text.style.TextOverflow.Visible
                        else androidx.compose.ui.text.style.TextOverflow.Ellipsis
                    )
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        AppChip(
                            debate.difficulty.replaceFirstChar { it.uppercase() },
                            debate.difficulty.toDifficultyColor()
                        )
                        Text(debate.createdAt.formatDate(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    }
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${debate.finalScore ?: 0}%",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Black,
                    color = (debate.finalScore ?: 0).toScoreColor()
                )
                Text("+${debate.xpEarned ?: 0} XP", style = MaterialTheme.typography.labelSmall, color = Success)
                Icon(
                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    null, tint = TextMuted, modifier = Modifier.size(18.dp)
                )
            }
        }

        if (expanded) {
            Spacer(Modifier.height(12.dp))
            HorizontalDivider(color = GlassBorder, thickness = 0.5.dp)
            Spacer(Modifier.height(12.dp))

            // Details
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                DetailItem("Turns", "${debate.totalTurns}")
                DetailItem("Duration", debate.duration?.formatDuration() ?: "—")
                DetailItem("Personality", debate.aiPersonality.toPersonalityIcon() + " " + debate.aiPersonality.toPersonalityName().split(" ").first())
            }

            if (!debate.summary.isNullOrBlank()) {
                Spacer(Modifier.height(10.dp))
                Text(debate.summary, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
            }

            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = onRematch,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryBlue400),
                border = BorderStroke(1.dp, PrimaryBlue.copy(0.4f))
            ) {
                Icon(Icons.Default.Replay, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Rematch on this topic", style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

@Composable
private fun DetailItem(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        Text(value, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = TextPrimary)
    }
}
