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
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.DebateViewModel
import com.aidebatepartner.app.utils.toPersonalityIcon
import com.aidebatepartner.app.utils.toPersonalityName

private val difficulties = listOf("beginner", "intermediate", "advanced", "expert")
private val personalities = listOf("logical", "socratic", "aggressive", "empathetic", "devil_advocate")

@Composable
fun DebateSetupScreen(
    viewModel: DebateViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            AppTopBar(title = "New Debate", onBack = onBack)

            Column(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Header
                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(
                            Brush.linearGradient(listOf(PrimaryBlue.copy(0.2f), Indigo500.copy(0.1f))),
                            RoundedCornerShape(16.dp)
                        )
                        .border(1.dp, PrimaryBlue.copy(0.3f), RoundedCornerShape(16.dp))
                        .padding(20.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            modifier = Modifier.size(48.dp)
                                .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                            contentAlignment = Alignment.Center
                        ) { Text("🧠", fontSize = 24.sp) }
                        Column {
                            Text("Configure Your Debate", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("Challenge Aria AI on any topic", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        }
                    }
                }

                // Error
                if (state.error != null) {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(Error.copy(0.1f), RoundedCornerShape(12.dp))
                            .border(1.dp, Error.copy(0.3f), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) { Text(state.error ?: "", color = Error, style = MaterialTheme.typography.bodySmall) }
                }

                // Topic input
                Column {
                    Text("Debate Topic *", style = MaterialTheme.typography.labelMedium, color = TextSecondary, modifier = Modifier.padding(bottom = 8.dp))
                    OutlinedTextField(
                        value = state.topic,
                        onValueChange = { viewModel.setTopic(it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("e.g. Social media does more harm than good", color = TextMuted) },
                        minLines = 2,
                        maxLines = 3,
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
                }

                // Your position (optional)
                Column {
                    Text("Your Position (optional)", style = MaterialTheme.typography.labelMedium, color = TextSecondary, modifier = Modifier.padding(bottom = 8.dp))
                    OutlinedTextField(
                        value = state.userPosition,
                        onValueChange = { viewModel.setUserPosition(it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("e.g. I argue that social media is harmful...", color = TextMuted) },
                        maxLines = 2,
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
                }

                // Difficulty
                Column {
                    Text("Difficulty Level", style = MaterialTheme.typography.labelMedium, color = TextSecondary, modifier = Modifier.padding(bottom = 10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        difficulties.forEach { d ->
                            val selected = state.difficulty == d
                            val color = when (d) {
                                "beginner" -> Success
                                "intermediate" -> Warning
                                "advanced" -> Error
                                else -> FallacyPurple
                            }
                            Box(
                                modifier = Modifier.weight(1f)
                                    .background(
                                        if (selected) color.copy(0.2f) else GlassBg,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .border(1.dp, if (selected) color.copy(0.5f) else GlassBorder, RoundedCornerShape(10.dp))
                                    .clickable { viewModel.setDifficulty(d) }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    d.replaceFirstChar { it.uppercase() },
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selected) color else TextSecondary
                                )
                            }
                        }
                    }
                }

                // AI Personality
                Column {
                    Text("AI Personality", style = MaterialTheme.typography.labelMedium, color = TextSecondary, modifier = Modifier.padding(bottom = 10.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        personalities.chunked(2).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                row.forEach { p ->
                                    val selected = state.aiPersonality == p
                                    Box(
                                        modifier = Modifier.weight(1f)
                                            .background(
                                                if (selected) PrimaryBlue.copy(0.2f) else GlassBg,
                                                RoundedCornerShape(12.dp)
                                            )
                                            .border(1.dp, if (selected) PrimaryBlue.copy(0.5f) else GlassBorder, RoundedCornerShape(12.dp))
                                            .clickable { viewModel.setAiPersonality(p) }
                                            .padding(12.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            Text(p.toPersonalityIcon(), fontSize = 18.sp)
                                            Column {
                                                Text(p.toPersonalityName(), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold,
                                                    color = if (selected) PrimaryBlue400 else TextPrimary)
                                            }
                                        }
                                    }
                                }
                                if (row.size == 1) Spacer(Modifier.weight(1f))
                            }
                        }
                    }
                }

                // Start button
                PrimaryButton(
                    text = "Begin Debate",
                    onClick = { viewModel.startDebate() },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                    isLoading = state.isLoading,
                    enabled = state.topic.isNotBlank(),
                    icon = { Text("🧠", fontSize = 18.sp) }
                )
            }
        }
    }
}
