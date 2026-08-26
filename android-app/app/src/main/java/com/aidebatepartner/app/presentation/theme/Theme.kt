package com.aidebatepartner.app.presentation.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = PrimaryBlue700,
    onPrimaryContainer = PrimaryBlue400,
    secondary = Indigo500,
    onSecondary = Color.White,
    secondaryContainer = Indigo600,
    onSecondaryContainer = Indigo400,
    tertiary = Success,
    onTertiary = Color.White,
    background = DarkBg,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkCard,
    onSurfaceVariant = TextSecondary,
    error = Error,
    onError = Color.White,
    outline = GlassBorder,
    outlineVariant = GlassBg,
    scrim = Color(0x80000000),
    inverseSurface = TextPrimary,
    inverseOnSurface = DarkBg,
    inversePrimary = PrimaryBlue700,
)

@Composable
fun AiDebatePartnerTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            // window.statusBarColor handled by WindowCompat
            // window.navigationBarColor handled by WindowCompat
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = AppTypography,
        content = content
    )
}

