package com.aidebatepartner.app.presentation.screens.splash

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.components.GradientBackground
import com.aidebatepartner.app.presentation.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigate: (isAuthenticated: Boolean) -> Unit,
    isLoggedIn: Boolean
) {
    var visible by remember { mutableStateOf(false) }
    var dotsVisible by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (visible) 1f else 0.5f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "scale"
    )

    LaunchedEffect(Unit) {
        delay(200)
        visible = true
        delay(400)
        dotsVisible = true
        delay(1800)
        onNavigate(isLoggedIn)
    }

    GradientBackground {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo
            AnimatedVisibility(
                visible = visible,
                enter = scaleIn(spring(Spring.DampingRatioMediumBouncy)) + fadeIn()
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .scale(scale)
                        .background(
                            Brush.linearGradient(listOf(PrimaryBlue, Indigo500)),
                            RoundedCornerShape(28.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧠", fontSize = 48.sp)
                }
            }

            Spacer(Modifier.height(24.dp))

            AnimatedVisibility(visible = visible, enter = fadeIn(tween(600, 300))) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "AI Debate Partner",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Think Sharper. Argue Better.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            }

            Spacer(Modifier.height(48.dp))

            AnimatedVisibility(visible = dotsVisible, enter = fadeIn(tween(400))) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    repeat(3) { i ->
                        val infiniteTransition = rememberInfiniteTransition(label = "dot$i")
                        val alpha by infiniteTransition.animateFloat(
                            initialValue = 0.3f, targetValue = 1f,
                            animationSpec = infiniteRepeatable(
                                tween(600, delayMillis = i * 200),
                                RepeatMode.Reverse
                            ),
                            label = "alpha$i"
                        )
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(PrimaryBlue.copy(alpha = alpha), androidx.compose.foundation.shape.CircleShape)
                        )
                    }
                }
            }
        }
    }
}
