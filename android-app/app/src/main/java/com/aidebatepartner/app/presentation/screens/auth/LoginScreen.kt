package com.aidebatepartner.app.presentation.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    onForgotPassword: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state.isAuthenticated) {
        if (state.isAuthenticated && state.user != null) onLoginSuccess()
    }

    LaunchedEffect(state.error) {
        if (state.error != null) {
            // Error shown inline
        }
    }

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(60.dp))

            // Logo
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(
                        Brush.linearGradient(listOf(PrimaryBlue, Indigo500)),
                        RoundedCornerShape(20.dp)
                    ),
                contentAlignment = Alignment.Center
            ) { Text("🧠", fontSize = 36.sp) }

            Spacer(Modifier.height(20.dp))

            Text("Welcome back", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(6.dp))
            Text("Sign in to continue your debate training", style = MaterialTheme.typography.bodyMedium, color = TextSecondary, textAlign = TextAlign.Center)

            Spacer(Modifier.height(36.dp))

            // Error banner
            AnimatedVisibility(visible = state.error != null) {
                Column {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Error.copy(0.1f), RoundedCornerShape(12.dp))
                            .border(1.dp, Error.copy(0.3f), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text(state.error ?: "", color = Error, style = MaterialTheme.typography.bodySmall)
                    }
                    Spacer(Modifier.height(16.dp))
                }
            }

            // Form
            AppTextField(
                value = email,
                onValueChange = { email = it; viewModel.clearError() },
                label = "Email",
                placeholder = "you@example.com",
                leadingIcon = { Icon(Icons.Default.Email, null, tint = TextMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next)
            )

            Spacer(Modifier.height(16.dp))

            AppTextField(
                value = password,
                onValueChange = { password = it; viewModel.clearError() },
                label = "Password",
                placeholder = "••••••••",
                leadingIcon = { Icon(Icons.Default.Lock, null, tint = TextMuted) },
                isPassword = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
            )

            Spacer(Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onForgotPassword) {
                    Text("Forgot password?", color = PrimaryBlue400, style = MaterialTheme.typography.labelMedium)
                }
            }

            Spacer(Modifier.height(24.dp))

            PrimaryButton(
                text = "Sign In",
                onClick = { viewModel.login(email, password) },
                modifier = Modifier.fillMaxWidth(),
                isLoading = state.isLoading
            )

            Spacer(Modifier.height(24.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Don't have an account? ", color = TextSecondary, style = MaterialTheme.typography.bodyMedium)
                TextButton(onClick = onNavigateToRegister, contentPadding = PaddingValues(0.dp)) {
                    Text("Create one free", color = PrimaryBlue400, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
