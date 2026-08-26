package com.aidebatepartner.app.presentation.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel

@Composable
fun ForgotPasswordScreen(
    viewModel: AuthViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }

    GradientBackground {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AppTopBar(title = "Reset Password", onBack = onBack)
            Spacer(Modifier.height(40.dp))

            Text("🔐", fontSize = 56.sp)
            Spacer(Modifier.height(20.dp))
            Text("Forgot your password?", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("Enter your email and we'll send you reset instructions.", style = MaterialTheme.typography.bodyMedium, color = TextSecondary, textAlign = TextAlign.Center)
            Spacer(Modifier.height(32.dp))

            AnimatedVisibility(visible = state.successMessage != null) {
                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(Success.copy(0.1f), androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
                        .border(1.dp, Success.copy(0.3f), androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) { Text(state.successMessage ?: "", color = Success, style = MaterialTheme.typography.bodySmall) }
            }

            AnimatedVisibility(visible = state.error != null) {
                Box(
                    modifier = Modifier.fillMaxWidth()
                        .background(Error.copy(0.1f), androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
                        .border(1.dp, Error.copy(0.3f), androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) { Text(state.error ?: "", color = Error, style = MaterialTheme.typography.bodySmall) }
            }

            Spacer(Modifier.height(16.dp))

            AppTextField(
                value = email, onValueChange = { email = it; viewModel.clearError() },
                label = "Email", placeholder = "you@example.com",
                leadingIcon = { Icon(Icons.Default.Email, null, tint = TextMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done)
            )

            Spacer(Modifier.height(24.dp))

            PrimaryButton(
                text = "Send Reset Instructions",
                onClick = { viewModel.forgotPassword(email) },
                modifier = Modifier.fillMaxWidth(),
                isLoading = state.isLoading
            )
        }
    }
}
