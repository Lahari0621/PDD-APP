package com.aidebatepartner.app.presentation.screens.onboarding

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.*
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
import kotlinx.coroutines.launch

data class OnboardingPage(
    val emoji: String,
    val title: String,
    val subtitle: String,
    val accentColor: androidx.compose.ui.graphics.Color
)

val onboardingPages = listOf(
    OnboardingPage("🧠", "AI Debate Partner", "Practice real-time debates with AI while detecting logical fallacies instantly.", PrimaryBlue),
    OnboardingPage("⚡", "Detect Fallacies", "Our hybrid AI engine identifies 10+ logical fallacies with up to 94% accuracy in real-time.", Warning),
    OnboardingPage("📊", "Track Progress", "Visualize your critical thinking growth with skill radar charts and performance analytics.", Success),
    OnboardingPage("🏆", "Level Up", "Earn XP, unlock achievements, and climb from Bronze to Diamond tier as you improve.", FallacyAmber)
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onGetStarted: () -> Unit,
    onLogin: () -> Unit
) {
    val pagerState = rememberPagerState { onboardingPages.size }
    val scope = rememberCoroutineScope()

    GradientBackground {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Skip button
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onGetStarted) {
                    Text("Skip", color = TextSecondary)
                }
            }

            Spacer(Modifier.weight(0.5f))

            // Pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxWidth()
            ) { page ->
                val p = onboardingPages[page]
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
                ) {
                    // Emoji in gradient circle
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .background(
                                Brush.radialGradient(listOf(p.accentColor.copy(0.3f), p.accentColor.copy(0.05f))),
                                CircleShape
                            )
                            .border(2.dp, p.accentColor.copy(0.4f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(p.emoji, fontSize = 56.sp)
                    }

                    Spacer(Modifier.height(32.dp))

                    Text(
                        p.title,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center,
                        color = TextPrimary
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        p.subtitle,
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                        color = TextSecondary,
                        lineHeight = 26.sp
                    )
                }
            }

            Spacer(Modifier.weight(0.5f))

            // Page indicators
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                repeat(onboardingPages.size) { i ->
                    val isSelected = pagerState.currentPage == i
                    val width by animateDpAsState(if (isSelected) 24.dp else 8.dp, label = "dot")
                    Box(
                        modifier = Modifier
                            .height(8.dp)
                            .width(width)
                            .background(
                                if (isSelected) PrimaryBlue else GlassBorder,
                                RoundedCornerShape(4.dp)
                            )
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // CTA Buttons
            if (pagerState.currentPage == onboardingPages.size - 1) {
                PrimaryButton(
                    text = "Get Started Free",
                    onClick = onGetStarted,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(12.dp))
                GlassButton(
                    text = "I already have an account",
                    onClick = onLogin,
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                PrimaryButton(
                    text = "Next",
                    onClick = {
                        scope.launch {
                            pagerState.animateScrollToPage(pagerState.currentPage + 1)
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(12.dp))
                TextButton(onClick = onLogin, modifier = Modifier.fillMaxWidth()) {
                    Text("Already have an account? Sign In", color = TextSecondary)
                }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
