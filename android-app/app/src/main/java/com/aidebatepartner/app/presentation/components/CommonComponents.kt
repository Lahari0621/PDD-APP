package com.aidebatepartner.app.presentation.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.aidebatepartner.app.presentation.theme.*

// ─── Gradient Background ───────────────────────────────────────────────────

@Composable
fun GradientBackground(content: @Composable BoxScope.() -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
            .drawBehind {
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(PrimaryBlue.copy(alpha = 0.12f), Color.Transparent),
                        center = Offset(size.width * 0.2f, size.height * 0.15f),
                        radius = size.width * 0.7f
                    )
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Indigo500.copy(alpha = 0.08f), Color.Transparent),
                        center = Offset(size.width * 0.85f, size.height * 0.75f),
                        radius = size.width * 0.6f
                    )
                )
            },
        content = content
    )
}

// ─── Glass Card ─────────────────────────────────────────────────────────────

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    borderColor: Color = GlassBorder,
    content: @Composable ColumnScope.() -> Unit
) {
    val baseModifier = modifier
        .background(GlassBg, RoundedCornerShape(16.dp))
        .border(1.dp, borderColor, RoundedCornerShape(16.dp))

    if (onClick != null) {
        Column(
            modifier = baseModifier.clickable(onClick = onClick).padding(16.dp),
            content = content
        )
    } else {
        Column(
            modifier = baseModifier.padding(16.dp),
            content = content
        )
    }
}

// ─── Gradient Text ──────────────────────────────────────────────────────────

@Composable
fun GradientText(
    text: String,
    modifier: Modifier = Modifier,
    style: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.headlineLarge,
    gradient: Brush = Brush.horizontalGradient(
        colors = listOf(GradientStart, GradientMid, GradientEnd)
    )
) {
    Text(
        text = text,
        modifier = modifier,
        style = style.copy(
            brush = gradient
        )
    )
}

// ─── Primary Button ─────────────────────────────────────────────────────────

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
    icon: @Composable (() -> Unit)? = null
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(52.dp),
        enabled = enabled && !isLoading,
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = PrimaryBlue,
            contentColor = Color.White,
            disabledContainerColor = PrimaryBlue.copy(alpha = 0.4f),
            disabledContentColor = Color.White.copy(alpha = 0.5f)
        ),
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 0.dp,
            pressedElevation = 0.dp
        )
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = Color.White,
                strokeWidth = 2.dp
            )
        } else {
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                icon?.invoke()
                if (icon != null) Spacer(Modifier.width(8.dp))
                Text(text, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}

// ─── Glass Button ───────────────────────────────────────────────────────────

@Composable
fun GlassButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: @Composable (() -> Unit)? = null
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = GlassBg,
            contentColor = TextPrimary
        ),
        border = BorderStroke(1.dp, GlassBorder)
    ) {
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            icon?.invoke()
            if (icon != null) Spacer(Modifier.width(8.dp))
            Text(text, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }
    }
}

// ─── Input Field ────────────────────────────────────────────────────────────

@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    isPassword: Boolean = false,
    isError: Boolean = false,
    errorMessage: String? = null,
    maxLines: Int = 1,
    minLines: Int = 1,
    keyboardOptions: androidx.compose.foundation.text.KeyboardOptions = androidx.compose.foundation.text.KeyboardOptions.Default,
    keyboardActions: androidx.compose.foundation.text.KeyboardActions = androidx.compose.foundation.text.KeyboardActions.Default
) {
    var passwordVisible by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        if (label.isNotBlank()) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = TextSecondary,
                modifier = Modifier.padding(bottom = 6.dp)
            )
        }
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, color = TextMuted) },
            leadingIcon = leadingIcon,
            trailingIcon = if (isPassword) {
                {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = null,
                            tint = TextMuted
                        )
                    }
                }
            } else trailingIcon,
            visualTransformation = if (isPassword && !passwordVisible)
                androidx.compose.ui.text.input.PasswordVisualTransformation()
            else androidx.compose.ui.text.input.VisualTransformation.None,
            isError = isError,
            maxLines = maxLines,
            minLines = minLines,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PrimaryBlue,
                unfocusedBorderColor = GlassBorder,
                errorBorderColor = Error,
                focusedContainerColor = GlassBg,
                unfocusedContainerColor = GlassBg,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                cursorColor = PrimaryBlue
            )
        )
        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                color = Error,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(top = 4.dp, start = 4.dp)
            )
        }
    }
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

@Composable
fun StatCard(
    label: String,
    value: String,
    icon: @Composable () -> Unit,
    accentColor: Color,
    modifier: Modifier = Modifier,
    subtitle: String? = null
) {
    GlassCard(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(accentColor.copy(alpha = 0.15f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) { icon() }
            if (subtitle != null) {
                Text(subtitle, style = MaterialTheme.typography.labelSmall, color = Success)
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black, color = TextPrimary)
        Text(label, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
    }
}

// ─── Score Bar ──────────────────────────────────────────────────────────────

@Composable
fun ScoreBar(
    score: Int,
    modifier: Modifier = Modifier,
    color: Color = PrimaryBlue,
    animated: Boolean = true
) {
    val animatedWidth by animateFloatAsState(
        targetValue = if (animated) score / 100f else score / 100f,
        animationSpec = tween(1000, easing = EaseOutCubic),
        label = "score"
    )
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(6.dp)
            .background(GlassBorder, RoundedCornerShape(3.dp))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(animatedWidth)
                .fillMaxHeight()
                .background(
                    Brush.horizontalGradient(listOf(color.copy(alpha = 0.7f), color)),
                    RoundedCornerShape(3.dp)
                )
        )
    }
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

@Composable
fun TypingIndicator() {
    val infiniteTransition = rememberInfiniteTransition(label = "typing")
    Row(
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        repeat(3) { index ->
            val offsetY by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = -8f,
                animationSpec = infiniteRepeatable(
                    animation = tween(400, delayMillis = index * 133),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "dot$index"
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .offset(y = offsetY.dp)
                    .background(PrimaryBlue400, CircleShape)
            )
        }
    }
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

@Composable
fun ShimmerBox(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerX by infiniteTransition.animateFloat(
        initialValue = -1f, targetValue = 2f,
        animationSpec = infiniteRepeatable(tween(1200), RepeatMode.Restart),
        label = "shimmerX"
    )
    Box(
        modifier = modifier.background(
            Brush.horizontalGradient(
                colors = listOf(GlassBg, GlassBorder, GlassBg),
                startX = shimmerX * 300f,
                endX = shimmerX * 300f + 300f
            ),
            RoundedCornerShape(8.dp)
        )
    )
}

// ─── Error State ────────────────────────────────────────────────────────────

@Composable
fun ErrorState(
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("⚠️", fontSize = 48.sp, textAlign = TextAlign.Center)
        Spacer(Modifier.height(16.dp))
        Text(message, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center, color = TextSecondary)
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Retry", onRetry, modifier = Modifier.width(120.dp))
        }
    }
}

// ─── Empty State ────────────────────────────────────────────────────────────

@Composable
fun EmptyState(
    emoji: String,
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    action: @Composable (() -> Unit)? = null
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(emoji, fontSize = 56.sp, textAlign = TextAlign.Center)
        Spacer(Modifier.height(16.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center, color = TextSecondary)
        if (action != null) {
            Spacer(Modifier.height(20.dp))
            action()
        }
    }
}

// ─── Chip ───────────────────────────────────────────────────────────────────

@Composable
fun AppChip(
    text: String,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    val mod = modifier
        .background(color.copy(alpha = 0.15f), RoundedCornerShape(20.dp))
        .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
        .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
        .padding(horizontal = 10.dp, vertical = 4.dp)
    Box(mod) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.SemiBold)
    }
}

// ─── Section Header ─────────────────────────────────────────────────────────

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    action: @Composable (() -> Unit)? = null
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        action?.invoke()
    }
}

// ─── Top App Bar ────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    TopAppBar(
        title = { Text(title, fontWeight = FontWeight.Bold) },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Color.Transparent,
            titleContentColor = TextPrimary,
            actionIconContentColor = TextPrimary
        )
    )
}

// ─── Fallacy Badge ──────────────────────────────────────────────────────────

@Composable
fun FallacyBadge(
    name: String,
    confidence: Double,
    color: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(20.dp))
            .border(1.dp, color.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text("⚠️", fontSize = 10.sp)
        Text(name, style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.SemiBold)
        Text("${(confidence * 100).toInt()}%", style = MaterialTheme.typography.labelSmall, color = color.copy(alpha = 0.7f))
    }
}

// ─── XP Progress Bar ────────────────────────────────────────────────────────

@Composable
fun XpProgressBar(xp: Int, modifier: Modifier = Modifier) {
    val progress = (xp % 100) / 100f
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Level ${xp / 100 + 1}", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            Text("${xp % 100}/100 XP", style = MaterialTheme.typography.labelSmall, color = Warning)
        }
        Spacer(Modifier.height(4.dp))
        ScoreBar(score = (progress * 100).toInt(), color = Warning)
    }
}
