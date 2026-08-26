package com.aidebatepartner.app.presentation.screens.profile

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
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel
import com.aidebatepartner.app.utils.*

private val ACHIEVEMENTS = listOf(
    Triple("first_debate", "First Debate", "🎯"),
    Triple("fallacy_hunter", "Fallacy Hunter", "🔍"),
    Triple("streak_7", "7-Day Streak", "🔥"),
    Triple("logic_master", "Logic Master", "🧠"),
    Triple("debate_champion", "Debate Champion", "🏆"),
    Triple("scholar", "Scholar", "📚")
)

@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    onBack: () -> Unit,
    onLogout: () -> Unit
) {
    val state by authViewModel.uiState.collectAsState()
    val user = state.user
    var isEditing by remember { mutableStateOf(false) }
    var editUsername by remember { mutableStateOf(user?.username ?: "") }
    var editBio by remember { mutableStateOf(user?.bio ?: "") }
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(user) {
        editUsername = user?.username ?: ""
        editBio = user?.bio ?: ""
    }

    Scaffold(
        containerColor = DarkBg,
        topBar = {
            AppTopBar(
                title = "Profile",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { isEditing = !isEditing }) {
                        Icon(
                            if (isEditing) Icons.Default.Close else Icons.Default.Edit,
                            null, tint = if (isEditing) Error else TextSecondary
                        )
                    }
                }
            )
        }
    ) { padding ->
        GradientBackground {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile header card
                GlassCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier.size(72.dp)
                                .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                user?.username?.firstOrNull()?.uppercaseChar()?.toString() ?: "D",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Black,
                                color = androidx.compose.ui.graphics.Color.White
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            if (isEditing) {
                                OutlinedTextField(
                                    value = editUsername,
                                    onValueChange = { editUsername = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    label = { Text("Username") },
                                    singleLine = true,
                                    shape = RoundedCornerShape(10.dp),
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
                            } else {
                                Text(user?.username ?: "Debater", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                Text(user?.email ?: "", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 4.dp)) {
                                    AppChip((user?.tier ?: "Bronze").toTierIcon() + " " + (user?.tier ?: "Bronze"), (user?.tier ?: "Bronze").toTierColor())
                                    AppChip(user?.plan?.replaceFirstChar { it.uppercase() } ?: "Free", PrimaryBlue)
                                }
                            }
                        }
                    }

                    if (isEditing) {
                        Spacer(Modifier.height(12.dp))
                        OutlinedTextField(
                            value = editBio,
                            onValueChange = { editBio = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Bio") },
                            placeholder = { Text("Tell us about yourself...", color = TextMuted) },
                            maxLines = 3,
                            shape = RoundedCornerShape(10.dp),
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
                        Spacer(Modifier.height(12.dp))
                        PrimaryButton(
                            text = "Save Changes",
                            onClick = {
                                authViewModel.updateProfile(editUsername, editBio, null)
                                isEditing = false
                            },
                            modifier = Modifier.fillMaxWidth(),
                            isLoading = state.isLoading
                        )
                    } else if (!user?.bio.isNullOrBlank()) {
                        Spacer(Modifier.height(8.dp))
                        Text(user!!.bio!!, style = MaterialTheme.typography.bodySmall, color = TextSecondary, lineHeight = 18.sp)
                    }
                }

                // Stats
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Debates", "${user?.totalDebates ?: 0}",
                        { Icon(Icons.Default.Chat, null, tint = PrimaryBlue, modifier = Modifier.size(18.dp)) },
                        PrimaryBlue, modifier = Modifier.weight(1f))
                    StatCard("Wins", "${user?.debatesWon ?: 0}",
                        { Icon(Icons.Default.EmojiEvents, null, tint = Warning, modifier = Modifier.size(18.dp)) },
                        Warning, modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Logic", "${user?.logicScore ?: 50}",
                        { Icon(Icons.Default.Psychology, null, tint = Success, modifier = Modifier.size(18.dp)) },
                        Success, modifier = Modifier.weight(1f))
                    StatCard("Streak", "${user?.streak ?: 0}d",
                        { Icon(Icons.Default.Whatshot, null, tint = Error, modifier = Modifier.size(18.dp)) },
                        Error, modifier = Modifier.weight(1f))
                }

                // XP Progress
                GlassCard {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("⚡ Level ${user?.level ?: 1} Progress", style = MaterialTheme.typography.labelLarge)
                        Text("${user?.xp ?: 0} XP", color = Warning, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(8.dp))
                    XpProgressBar(xp = user?.xp ?: 0)
                }

                // Achievements
                GlassCard {
                    SectionHeader(title = "⭐ Achievements")
                    Spacer(Modifier.height(12.dp))
                    val unlockedIds = user?.achievements?.map { it.id } ?: emptyList()
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        ACHIEVEMENTS.chunked(3).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                row.forEach { (id, name, emoji) ->
                                    val unlocked = unlockedIds.contains(id) || (id == "first_debate" && (user?.totalDebates ?: 0) > 0)
                                    Box(
                                        modifier = Modifier.weight(1f)
                                            .background(
                                                if (unlocked) Warning.copy(0.1f) else GlassBg.copy(0.5f),
                                                RoundedCornerShape(12.dp)
                                            )
                                            .border(1.dp, if (unlocked) Warning.copy(0.3f) else GlassBorder.copy(0.3f), RoundedCornerShape(12.dp))
                                            .padding(10.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text(
                                                emoji,
                                                fontSize = 24.sp,
                                                modifier = Modifier.then(
                                                    if (!unlocked) Modifier.then(Modifier) else Modifier
                                                )
                                            )
                                            Spacer(Modifier.height(4.dp))
                                            Text(
                                                name,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = if (unlocked) Warning else TextMuted,
                                                fontWeight = if (unlocked) FontWeight.SemiBold else FontWeight.Normal,
                                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                                maxLines = 2
                                            )
                                        }
                                    }
                                }
                                if (row.size < 3) repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                            }
                        }
                    }
                }

                // Settings section
                GlassCard {
                    SectionHeader(title = "⚙️ Settings")
                    Spacer(Modifier.height(12.dp))
                    listOf(
                        Triple(Icons.Default.Notifications, "Notifications", TextSecondary),
                        Triple(Icons.Default.Security, "Privacy & Security", TextSecondary),
                        Triple(Icons.Default.Help, "Help & Support", TextSecondary),
                        Triple(Icons.Default.Info, "About", TextSecondary)
                    ).forEach { (icon, label, color) ->
                        Row(
                            modifier = Modifier.fillMaxWidth()
                                .clickable { }
                                .padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
                                Text(label, style = MaterialTheme.typography.bodyMedium, color = TextPrimary)
                            }
                            Icon(Icons.Default.ChevronRight, null, tint = TextMuted, modifier = Modifier.size(18.dp))
                        }
                        if (label != "About") HorizontalDivider(color = GlassBorder, thickness = 0.5.dp)
                    }
                }

                // Logout
                OutlinedButton(
                    onClick = { showLogoutDialog = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                    border = BorderStroke(1.dp, Error.copy(0.4f))
                ) {
                    Icon(Icons.Default.Logout, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Sign Out", fontWeight = FontWeight.SemiBold)
                }

                Spacer(Modifier.height(8.dp))
            }
        }
    }

    // Logout confirmation
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            containerColor = DarkSurface,
            title = { Text("Sign Out", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to sign out?", color = TextSecondary) },
            confirmButton = {
                TextButton(onClick = { showLogoutDialog = false; onLogout() }) {
                    Text("Sign Out", color = Error, fontWeight = FontWeight.SemiBold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
