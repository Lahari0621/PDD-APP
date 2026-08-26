package com.aidebatepartner.app.presentation.screens.analytics

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
import androidx.compose.ui.unit.*
import androidx.hilt.navigation.compose.hiltViewModel
import com.aidebatepartner.app.domain.model.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.AnalyticsViewModel
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel
import com.aidebatepartner.app.utils.*

@Composable
fun AnalyticsScreen(
    authViewModel: AuthViewModel,
    onBack: () -> Unit,
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val authState by authViewModel.uiState.collectAsState()
    val user = authState.user
    val analytics = state.analytics
    val overview = analytics?.overview

    Scaffold(
        containerColor = DarkBg,
        topBar = {
            AppTopBar(
                title = "Analytics",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadAnalytics() }) {
                        Icon(Icons.Default.Refresh, null, tint = TextSecondary)
                    }
                }
            )
        }
    ) { padding ->
        GradientBackground {
            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = PrimaryBlue)
                        Spacer(Modifier.height(12.dp))
                        Text("Loading analytics...", color = TextSecondary)
                    }
                }
                return@GradientBackground
            }

            if (state.error != null) {
                ErrorState(state.error!!, onRetry = { viewModel.loadAnalytics() },
                    modifier = Modifier.fillMaxSize().padding(padding))
                return@GradientBackground
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Tier card
                item {
                    val tierColor = (user?.tier ?: "Bronze").toTierColor()
                    val tierIcon = (user?.tier ?: "Bronze").toTierIcon()
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(
                                Brush.linearGradient(listOf(tierColor.copy(0.2f), tierColor.copy(0.05f))),
                                RoundedCornerShape(16.dp)
                            )
                            .border(1.dp, tierColor.copy(0.4f), RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(tierIcon, fontSize = 40.sp)
                                Column {
                                    Text("${user?.tier ?: "Bronze"} Tier", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black, color = tierColor)
                                    Text("Level ${user?.level ?: 1}", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                                }
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("${user?.xp ?: 0} XP", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = Warning)
                                Text("Total earned", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                            }
                        }
                        Spacer(Modifier.height(10.dp))
                        XpProgressBar(xp = user?.xp ?: 0)
                    }
                }

                // Overview stats
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        StatCard("Win Rate", "${overview?.winRate ?: 0}%",
                            { Icon(Icons.Default.EmojiEvents, null, tint = Warning, modifier = Modifier.size(20.dp)) },
                            Warning, modifier = Modifier.weight(1f),
                            subtitle = "${overview?.debatesWon ?: 0}W / ${overview?.totalDebates ?: 0}T")
                        StatCard("Logic Score", "${overview?.logicScore ?: 50}",
                            { Icon(Icons.Default.Psychology, null, tint = Success, modifier = Modifier.size(20.dp)) },
                            Success, modifier = Modifier.weight(1f))
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        StatCard("Streak", "${overview?.streak ?: 0}d",
                            { Icon(Icons.Default.Whatshot, null, tint = Error, modifier = Modifier.size(20.dp)) },
                            Error, modifier = Modifier.weight(1f),
                            subtitle = "Best: ${overview?.longestStreak ?: 0}d")
                        StatCard("Fallacies", "${overview?.totalFallaciesDetected ?: 0}",
                            { Icon(Icons.Default.Warning, null, tint = FallacyPurple, modifier = Modifier.size(20.dp)) },
                            FallacyPurple, modifier = Modifier.weight(1f))
                    }
                }

                // Skills radar (text-based since no chart lib)
                if (analytics?.skills != null) {
                    item {
                        GlassCard {
                            SectionHeader(title = "🎯 Skill Assessment")
                            Spacer(Modifier.height(12.dp))
                            val skills = analytics.skills
                            listOf(
                                Triple("Logic", skills.logic, PrimaryBlue),
                                Triple("Persuasion", skills.persuasion, Indigo500),
                                Triple("Evidence", skills.evidence, Success),
                                Triple("Clarity", skills.clarity, Warning),
                                Triple("Rebuttal", skills.rebuttal, FallacyPink),
                                Triple("Structure", skills.structure, FallacyCyan)
                            ).forEach { (name, value, color) ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text(name, style = MaterialTheme.typography.labelMedium, color = TextSecondary, modifier = Modifier.width(80.dp))
                                    Box(modifier = Modifier.weight(1f)) {
                                        ScoreBar(score = value, color = color)
                                    }
                                    Text("$value", style = MaterialTheme.typography.labelMedium, color = color, fontWeight = FontWeight.Bold, modifier = Modifier.width(32.dp))
                                }
                            }
                        }
                    }
                }

                // Logic score history
                if (!analytics?.logicScoreHistory.isNullOrEmpty()) {
                    item {
                        GlassCard {
                            SectionHeader(title = "📈 Logic Score Trend")
                            Spacer(Modifier.height(12.dp))
                            val history = analytics!!.logicScoreHistory.takeLast(10)
                            Row(
                                modifier = Modifier.fillMaxWidth().height(80.dp),
                                verticalAlignment = Alignment.Bottom,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                val maxScore = history.maxOfOrNull { it.score } ?: 100
                                history.forEach { point ->
                                    val heightFraction = point.score.toFloat() / maxScore.toFloat()
                                    val color = point.score.toScoreColor()
                                    Column(
                                        modifier = Modifier.weight(1f),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Bottom
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .fillMaxHeight(heightFraction)
                                                .background(
                                                    Brush.verticalGradient(listOf(color, color.copy(0.4f))),
                                                    RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)
                                                )
                                        )
                                    }
                                }
                            }
                            Spacer(Modifier.height(4.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Oldest", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                Text("Latest", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                            }
                        }
                    }
                }

                // Fallacy breakdown
                if (!analytics?.fallacyBreakdown.isNullOrEmpty()) {
                    item {
                        GlassCard {
                            SectionHeader(title = "⚠️ Fallacy Breakdown")
                            Spacer(Modifier.height(12.dp))
                            val maxCount = analytics!!.fallacyBreakdown.maxOfOrNull { it.count } ?: 1
                            analytics.fallacyBreakdown.sortedByDescending { it.count }.forEach { fb ->
                                val color = fb.type.toFallacyColor()
                                val name = fb.type.replace("_", " ").split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text(name, style = MaterialTheme.typography.labelSmall, color = TextSecondary, modifier = Modifier.width(120.dp), maxLines = 1)
                                    Box(modifier = Modifier.weight(1f)) {
                                        ScoreBar(score = (fb.count.toFloat() / maxCount * 100).toInt(), color = color)
                                    }
                                    Text("${fb.count}", style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.Bold, modifier = Modifier.width(24.dp))
                                }
                            }
                        }
                    }
                }

                // Recent debates
                if (!analytics?.recentDebates.isNullOrEmpty()) {
                    item { SectionHeader(title = "💬 Recent Debates") }
                    items(analytics!!.recentDebates) { debate ->
                        GlassCard {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(debate.winner?.toWinnerEmoji() ?: "📚", fontSize = 24.sp)
                                    Column {
                                        Text(debate.topic, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium,
                                            maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                                            modifier = Modifier.widthIn(max = 200.dp))
                                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            AppChip(debate.difficulty.replaceFirstChar { it.uppercase() }, debate.difficulty.toDifficultyColor())
                                            Text(debate.createdAt.formatDate(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                        }
                                    }
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("${debate.finalScore ?: 0}%", fontWeight = FontWeight.Bold, color = PrimaryBlue400)
                                    Text("+${debate.xpEarned ?: 0} XP", style = MaterialTheme.typography.labelSmall, color = Success)
                                }
                            }
                        }
                    }
                }

                // Coaching tip
                if (analytics?.coachingTip != null) {
                    item {
                        GlassCard(borderColor = PrimaryBlue.copy(0.3f)) {
                            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text("🧠", fontSize = 24.sp)
                                Column {
                                    Text("AI Coach Tip", style = MaterialTheme.typography.labelLarge, color = PrimaryBlue400, fontWeight = FontWeight.SemiBold)
                                    Spacer(Modifier.height(4.dp))
                                    Text(analytics.coachingTip, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                                }
                            }
                        }
                    }
                }

                item { Spacer(Modifier.height(8.dp)) }
            }
        }
    }
}
