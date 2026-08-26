package com.aidebatepartner.app.presentation.screens.home

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.*
import com.aidebatepartner.app.presentation.theme.*

// HomeScreen is the landing/onboarding equivalent for authenticated users
// It redirects to Dashboard — kept for nav graph completeness
@Composable
fun HomeScreen(
    onGetStarted: () -> Unit
) {
    GradientBackground {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier.size(100.dp)
                    .background(Brush.linearGradient(listOf(PrimaryBlue, Indigo500)), CircleShape),
                contentAlignment = Alignment.Center
            ) { Text("🧠", fontSize = 48.sp) }

            Spacer(Modifier.height(24.dp))

            Text("AI Debate Partner", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("Think Sharper. Argue Better.", style = MaterialTheme.typography.bodyLarge, color = TextSecondary, textAlign = TextAlign.Center)

            Spacer(Modifier.height(40.dp))

            PrimaryButton("Go to Dashboard", onGetStarted, modifier = Modifier.fillMaxWidth())
        }
    }
}
