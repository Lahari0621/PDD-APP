package com.aidebatepartner.app.presentation.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel

private val difficultyOptions = listOf(
    Triple("beginner", "Beginner", "New to debate"),
    Triple("intermediate", "Intermediate", "Some experience"),
    Triple("advanced", "Advanced", "Experienced debater"),
    Triple("expert", "Expert", "Professional level")
)

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var difficulty by remember { mutableStateOf("beginner") }

    LaunchedEffect(state.isAuthenticated) {
        if (state.isAuthenticated && state.user != null) onRegisterSuccess()
    }

    val passwordStrength = when {
        password.length >= 8 && password.any { it.isUpperCase() } && password.any { it.isDigit() } -> 4
        password.length >= 8 && (password.any { it.isUpperCase() } || password.any { it.isDigit() }) -> 3
        password.length >= 8 -> 2
        password.isNotEmpty() -> 1
        else -> 0
    }
    val strengthColors = listOf(Color.Transparent, Error, Warning, Warning, Success)
    val strengthLabels = listOf("", "Weak", "Fair", "Good", "Strong")

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(48.dp))

            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) { Text("🧠", fontSize = 36.sp) }

            Spacer(Modifier.height(20.dp))
            Text("Create your account", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(6.dp))
            Text("Start your critical thinking journey", style = MaterialTheme.typography.bodyMedium, color = TextSecondary, textAlign = TextAlign.Center)
            Spacer(Modifier.height(32.dp))

            // Error
            AnimatedVisibility(visible = state.error != null) {
                Column {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                            .background(Error.copy(0.1f), RoundedCornerShape(12.dp))
                            .border(1.dp, Error.copy(0.3f), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) { Text(state.error ?: "", color = Error, style = MaterialTheme.typography.bodySmall) }
                    Spacer(Modifier.height(16.dp))
                }
            }

            AppTextField(
                value = username, onValueChange = { username = it; viewModel.clearError() },
                label = "Username", placeholder = "debatemaster",
                leadingIcon = { Icon(Icons.Default.Person, null, tint = TextMuted) },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
            )
            Spacer(Modifier.height(14.dp))

            AppTextField(
                value = email, onValueChange = { email = it; viewModel.clearError() },
                label = "Email", placeholder = "you@example.com",
                leadingIcon = { Icon(Icons.Default.Email, null, tint = TextMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next)
            )
            Spacer(Modifier.height(14.dp))

            AppTextField(
                value = password, onValueChange = { password = it; viewModel.clearError() },
                label = "Password", placeholder = "Min. 8 characters",
                leadingIcon = { Icon(Icons.Default.Lock, null, tint = TextMuted) },
                isPassword = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
            )

            // Password strength
            if (password.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    repeat(4) { i ->
                        Box(
                            modifier = Modifier.weight(1f).height(4.dp)
                                .background(
                                    if (i < passwordStrength) strengthColors[passwordStrength] else GlassBorder,
                                    RoundedCornerShape(2.dp)
                                )
                        )
                    }
                }
                if (passwordStrength > 0) {
                    Text(strengthLabels[passwordStrength], style = MaterialTheme.typography.labelSmall,
                        color = strengthColors[passwordStrength], modifier = Modifier.padding(top = 2.dp))
                }
            }

            Spacer(Modifier.height(20.dp))

            // Difficulty selector
            Text("Your debate level", style = MaterialTheme.typography.labelMedium, color = TextSecondary,
                modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                difficultyOptions.chunked(2).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        row.forEach { (value, label, desc) ->
                            val selected = difficulty == value
                            Box(
                                modifier = Modifier.weight(1f)
                                    .background(
                                        if (selected) PrimaryBlue.copy(0.2f) else GlassBg,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .border(
                                        1.dp,
                                        if (selected) PrimaryBlue.copy(0.5f) else GlassBorder,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable { difficulty = value }
                                    .padding(12.dp)
                            ) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(label, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
                                        if (selected) Text("✓", color = PrimaryBlue400, fontWeight = FontWeight.Bold)
                                    }
                                    Text(desc, style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(28.dp))

            PrimaryButton(
                text = "Create Account",
                onClick = { viewModel.register(username, email, password, difficulty) },
                modifier = Modifier.fillMaxWidth(),
                isLoading = state.isLoading
            )

            Spacer(Modifier.height(20.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Already have an account? ", color = TextSecondary, style = MaterialTheme.typography.bodyMedium)
                TextButton(onClick = onNavigateToLogin, contentPadding = PaddingValues(0.dp)) {
                    Text("Sign in", color = PrimaryBlue400, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}
