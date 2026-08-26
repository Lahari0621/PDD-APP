package com.aidebatepartner.app.presentation.screens.dashboard

import androidx.compose.animation.*
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
import com.aidebatepartner.app.domain.model.Debate
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.AnalyticsViewModel
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel
import com.aidebatepartner.app.presentation.viewmodel.DebateViewModel
import com.aidebatepartner.app.utils.*

@Composable
fun DashboardScreen(
    authViewModel: AuthViewModel,
    onStartDebate: (String) -> Unit,
    onNavigateToLearn: () -> Unit,
    onNavigateToAnalytics: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onLogout: () -> Unit,
    analyticsViewModel: AnalyticsViewModel = hiltViewModel(),
    debateViewModel: DebateViewModel = hiltViewModel()
) {
    val authState by authViewModel.uiState.collectAsState()
    val analyticsState by analyticsViewModel.uiState.collectAsState()
    val user = authState.user
    val analytics = analyticsState.analytics
    val overview = analytics?.overview

    val suggestedTopics = listOf(
        Triple("Social media does more harm than good", "social", "beginner"),
        Triple("AI will replace most jobs by 2040", "technology", "intermediate"),
        Triple("Universal Basic Income should be implemented", "economics", "advanced"),
        Triple("Climate change is the most pressing issue", "environment", "intermediate"),
        Triple("Space exploration is worth the investment", "science", "intermediate")
    )

    Scaffold(
        containerColor = DarkBg,
        bottomBar = {
            BottomNavBar(
                currentRoute = "dashboard",
                onNavigate = { route ->
                    when (route) {
                        "learn" -> onNavigateToLearn()
                        "analytics" -> onNavigateToAnalytics()
                        "profile" -> onNavigateToProfile()
                        "debate" -> onStartDebate("")
                    }
                }
            )
        }
    ) { padding ->
        GradientBackground {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "Welcome back,",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(
                                    user?.username ?: "Debater",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Black
                                )
                                Text(user?.tier?.toTierIcon() ?: "🥉", fontSize = 20.sp)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                AppChip("Level ${user?.level ?: 1}", PrimaryBlue)
                                AppChip("🔥 ${user?.streak ?: 0} streak", Warning)
                            }
                        }
                        // Avatar
                        Box(
                            modifier = Modifier.size(52.dp)
                                .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                user?.username?.firstOrNull()?.uppercaseChar()?.toString() ?: "D",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Black,
                                color = androidx.compose.ui.graphics.Color.White
                            )
                        }
                    }
                }

                // XP Bar
                item {
                    GlassCard {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("⚡ Experience Points", style = MaterialTheme.typography.labelLarge)
                            Text("${user?.xp?.toLocaleString() ?: 0} XP", color = Warning, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(8.dp))
                        XpProgressBar(xp = user?.xp ?: 0)
                    }
                }

                // Stats Grid
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        StatCard(
                            label = "Debates",
                            value = "${overview?.totalDebates ?: user?.totalDebates ?: 0}",
                            icon = { Icon(Icons.Default.Chat, null, tint = PrimaryBlue, modifier = Modifier.size(20.dp)) },
                            accentColor = PrimaryBlue,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "Win Rate",
                            value = "${overview?.winRate ?: 0}%",
                            icon = { Icon(Icons.Default.EmojiEvents, null, tint = Warning, modifier = Modifier.size(20.dp)) },
                            accentColor = Warning,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        StatCard(
                            label = "Logic Score",
                            value = "${overview?.logicScore ?: user?.logicScore ?: 50}",
                            icon = { Icon(Icons.Default.Psychology, null, tint = Success, modifier = Modifier.size(20.dp)) },
                            accentColor = Success,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "Fallacies",
                            value = "${overview?.totalFallaciesDetected ?: 0}",
                            icon = { Icon(Icons.Default.Warning, null, tint = FallacyPurple, modifier = Modifier.size(20.dp)) },
                            accentColor = FallacyPurple,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Start Debate CTA
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(
                                Brush.linearGradient(listOf(PrimaryBlue.copy(0.3f), Indigo500.copy(0.2f))),
                                RoundedCornerShape(16.dp)
                            )
                            .border(1.dp, PrimaryBlue.copy(0.4f), RoundedCornerShape(16.dp))
                            .clickable { onStartDebate("") }
                            .padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Start a New Debate", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text("Challenge Aria AI now", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            }
                            Box(
                                modifier = Modifier.size(44.dp)
                                    .background(PrimaryBlue, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Add, null, tint = androidx.compose.ui.graphics.Color.White)
                            }
                        }
                    }
                }

                // AI Coaching Tip
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

                // Suggested Topics
                item {
                    SectionHeader(
                        title = "⭐ Suggested Topics",
                        action = {
                            TextButton(onClick = onNavigateToHistory) {
                                Text("History", color = PrimaryBlue400, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    )
                }
                items(suggestedTopics) { (title, _, diff) ->
                    GlassCard(onClick = { onStartDebate(title) }) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                                Spacer(Modifier.height(4.dp))
                                AppChip(diff.replaceFirstChar { it.uppercase() }, diff.toDifficultyColor())
                            }
                            Icon(Icons.Default.ChevronRight, null, tint = TextMuted)
                        }
                    }
                }

                // Recent Debates
                if (!analytics?.recentDebates.isNullOrEmpty()) {
                    item { SectionHeader(title = "💬 Recent Debates") }
                    items(analytics!!.recentDebates.take(3)) { debate ->
                        RecentDebateCard(debate = debate, onClick = { onStartDebate(debate.topic) })
                    }
                }

                // Quick Links
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        QuickLinkCard("📚", "Learn", "Fallacies & Quizzes", Modifier.weight(1f), onClick = onNavigateToLearn)
                        QuickLinkCard("📊", "Analytics", "Track Progress", Modifier.weight(1f), onClick = onNavigateToAnalytics)
                    }
                }

                item { Spacer(Modifier.height(8.dp)) }
            }
        }
    }
}

@Composable
private fun RecentDebateCard(debate: Debate, onClick: () -> Unit) {
    GlassCard(onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(debate.winner?.toWinnerEmoji() ?: "📚", fontSize = 28.sp)
                Column {
                    Text(debate.topic, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium,
                        maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
                    Text(debate.createdAt.formatDate(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("${debate.finalScore ?: 0}%", fontWeight = FontWeight.Bold, color = PrimaryBlue400)
                Text("+${debate.xpEarned ?: 0} XP", style = MaterialTheme.typography.labelSmall, color = Success)
            }
        }
    }
}

@Composable
private fun QuickLinkCard(emoji: String, title: String, subtitle: String, modifier: Modifier, onClick: () -> Unit) {
    GlassCard(modifier = modifier, onClick = onClick) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text(emoji, fontSize = 28.sp)
            Spacer(Modifier.height(6.dp))
            Text(title, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        }
    }
}

@Composable
fun BottomNavBar(currentRoute: String, onNavigate: (String) -> Unit) {
    NavigationBar(containerColor = DarkSurface, tonalElevation = 0.dp) {
        listOf(
            Triple("dashboard", Icons.Default.Home, "Home"),
            Triple("debate", Icons.Default.Chat, "Debate"),
            Triple("learn", Icons.Default.MenuBook, "Learn"),
            Triple("analytics", Icons.Default.BarChart, "Analytics"),
            Triple("profile", Icons.Default.Person, "Profile")
        ).forEach { (route, icon, label) ->
            NavigationBarItem(
                selected = currentRoute == route,
                onClick = { if (currentRoute != route) onNavigate(route) },
                icon = { Icon(icon, label) },
                label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = PrimaryBlue400,
                    selectedTextColor = PrimaryBlue400,
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted,
                    indicatorColor = PrimaryBlue.copy(0.15f)
                )
            )
        }
    }
}

private fun Int.toLocaleString(): String = this.toString()
    .reversed().chunked(3).joinToString(",").reversed()
