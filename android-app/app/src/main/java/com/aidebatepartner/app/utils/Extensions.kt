package com.aidebatepartner.app.utils

import androidx.compose.ui.graphics.Color
import com.aidebatepartner.app.presentation.theme.*

fun String.toTierColor(): Color = when (this) {
    "Bronze" -> TierBronze
    "Silver" -> TierSilver
    "Gold" -> TierGold
    "Platinum" -> TierPlatinum
    "Diamond" -> TierDiamond
    else -> TierBronze
}

fun String.toTierIcon(): String = when (this) {
    "Bronze" -> "🥉"
    "Silver" -> "🥈"
    "Gold" -> "🥇"
    "Platinum" -> "💎"
    "Diamond" -> "💠"
    else -> "🥉"
}

fun String.toDifficultyColor(): Color = when (this) {
    "beginner" -> Success
    "intermediate" -> Warning
    "advanced" -> Error
    "expert" -> FallacyPurple
    else -> TextSecondary
}

fun String.toFallacyColor(): Color = when (this) {
    "ad_hominem" -> FallacyRed
    "strawman" -> FallacyAmber
    "slippery_slope" -> FallacyPurple
    "appeal_to_emotion" -> FallacyPink
    "false_dilemma" -> FallacyCyan
    "bandwagon" -> FallacyGreen
    "hasty_generalization" -> FallacyOrange
    "appeal_to_authority" -> FallacyIndigo
    "circular_reasoning" -> FallacyDarkRed
    "red_herring" -> FallacyViolet
    else -> FallacyAmber
}

fun String.toWinnerEmoji(): String = when (this) {
    "user" -> "🏆"
    "draw" -> "🤝"
    "ai" -> "📚"
    else -> "📚"
}

fun Int.toScoreColor(): Color = when {
    this >= 80 -> Success
    this >= 60 -> Warning
    else -> Error
}

fun String.toPersonalityIcon(): String = when (this) {
    "logical" -> "🧠"
    "socratic" -> "🤔"
    "aggressive" -> "⚡"
    "empathetic" -> "💙"
    "devil_advocate" -> "😈"
    else -> "🧠"
}

fun String.toPersonalityName(): String = when (this) {
    "logical" -> "The Logician"
    "socratic" -> "The Socratic"
    "aggressive" -> "The Challenger"
    "empathetic" -> "The Empath"
    "devil_advocate" -> "Devil's Advocate"
    else -> "The Logician"
}

fun String.formatTimestamp(): String {
    return try {
        val parts = this.split("T")
        if (parts.size >= 2) {
            val timePart = parts[1].substring(0, 5)
            timePart
        } else this
    } catch (e: Exception) { this }
}

fun String.formatDate(): String {
    return try {
        val parts = this.split("T")
        parts[0]
    } catch (e: Exception) { this }
}

fun Int.formatDuration(): String {
    val minutes = this / 60
    val seconds = this % 60
    return if (minutes > 0) "${minutes}m ${seconds}s" else "${seconds}s"
}
