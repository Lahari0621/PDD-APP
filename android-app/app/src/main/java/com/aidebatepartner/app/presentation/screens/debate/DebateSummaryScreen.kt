package com.aidebatepartner.app.presentation.screens.debate

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.domain.model.DebateSummary
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.utils.*

@Composable
fun DebateSummaryScreen(
    summary: DebateSummary,
    onNewDebate: () -> Unit,
    onBack: () -> Unit
) {
    val winnerEmoji = summary.winner?.toWinnerEmoji() ?: "📚"
    val winnerText = when (summary.winner) {
        "user" -> "You Won! 🎉"
        "draw" -> "It's a Draw! 🤝"
        else -> "Keep Practicing! 📚"
    }
    val winnerColor = when (summary.winner) {
        "user" -> Success
        "draw" -> Warning
        else -> PrimaryBlue400
    }

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(32.dp))

            // Winner badge
            Box(
                modifier = Modifier.size(100.dp)
                    .background(
                        Brush.radialGradient(listOf(winnerColor.copy(0.3f), winnerColor.copy(0.05f))),
                        CircleShape
                    )
                    .border(2.dp, winnerColor.copy(0.5f), CircleShape),
                contentAlignment = Alignment.Center
            ) { Text(winnerEmoji, fontSize = 48.sp) }

            Spacer(Modifier.height(16.dp))
            Text("Debate Complete!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(6.dp))
            Text(winnerText, style = MaterialTheme.typography.titleMedium, color = winnerColor, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(4.dp))
            Text(summary.topic, style = MaterialTheme.typography.bodySmall, color = TextMuted, textAlign = TextAlign.Center)

            Spacer(Modifier.height(24.dp))

            // Score cards
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                ScoreCard("Final Score", "${summary.finalScore}%", PrimaryBlue, Modifier.weight(1f))
                ScoreCard("Logic", "${summary.logicScore}%", Success, Modifier.weight(1f))
                ScoreCard("XP Earned", "+${summary.xpEarned}", Warning, Modifier.weight(1f))
            }

            Spacer(Modifier.height(12.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                ScoreCard("Turns", "${summary.totalTurns}", Indigo400, Modifier.weight(1f))
                ScoreCard("Duration", summary.duration.formatDuration(), FallacyPink, Modifier.weight(1f))
                ScoreCard("Persuasion", "${summary.persuasionScore}%", FallacyOrange, Modifier.weight(1f))
            }

            // Summary text
            if (!summary.summary.isNullOrBlank()) {
                Spacer(Modifier.height(16.dp))
                GlassCard {
                    Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("📋", fontSize = 20.sp)
                        Column {
                            Text("Debate Summary", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold, color = PrimaryBlue400)
                            Spacer(Modifier.height(6.dp))
                            Text(summary.summary, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                        }
                    }
                }
            }

            // Key Insights
            if (summary.keyInsights.isNotEmpty()) {
                Spacer(Modifier.height(12.dp))
                GlassCard {
                    Text("💡 Key Insights", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold, color = Warning)
                    Spacer(Modifier.height(8.dp))
                    summary.keyInsights.forEach { insight ->
                        Row(
                            modifier = Modifier.padding(vertical = 3.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("•", color = Warning, fontWeight = FontWeight.Bold)
                            Text(insight, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                        }
                    }
                }
            }

            // Strengths
            if (summary.strengths.isNotEmpty()) {
                Spacer(Modifier.height(12.dp))
                GlassCard(borderColor = Success.copy(0.3f)) {
                    Text("✅ Strengths", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold, color = Success)
                    Spacer(Modifier.height(8.dp))
                    summary.strengths.forEach { s ->
                        Row(modifier = Modifier.padding(vertical = 3.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("✓", color = Success, fontWeight = FontWeight.Bold)
                            Text(s, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                        }
                    }
                }
            }

            // Improvement Areas
            if (summary.improvementAreas.isNotEmpty()) {
                Spacer(Modifier.height(12.dp))
                GlassCard(borderColor = FallacyAmber.copy(0.3f)) {
                    Text("📈 Areas to Improve", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold, color = FallacyAmber)
                    Spacer(Modifier.height(8.dp))
                    summary.improvementAreas.forEach { area ->
                        Row(modifier = Modifier.padding(vertical = 3.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("→", color = FallacyAmber, fontWeight = FontWeight.Bold)
                            Text(area, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // Action buttons
            PrimaryButton(
                text = "Start New Debate",
                onClick = onNewDebate,
                modifier = Modifier.fillMaxWidth(),
                icon = { Text("🧠", fontSize = 18.sp) }
            )
            Spacer(Modifier.height(12.dp))
            GlassButton(
                text = "Back to Dashboard",
                onClick = onBack,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ScoreCard(label: String, value: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    Box(
        modifier = modifier
            .background(color.copy(0.1f), RoundedCornerShape(12.dp))
            .border(1.dp, color.copy(0.3f), RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black, color = color)
            Text(label, style = MaterialTheme.typography.labelSmall, color = TextMuted, textAlign = TextAlign.Center)
        }
    }
}
