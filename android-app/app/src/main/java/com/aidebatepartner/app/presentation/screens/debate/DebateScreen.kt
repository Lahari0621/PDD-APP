package com.aidebatepartner.app.presentation.screens.debate

import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import com.aidebatepartner.app.presentation.viewmodel.DebateViewModel

@Composable
fun DebateScreen(
    initialTopic: String = "",
    onBack: () -> Unit,
    viewModel: DebateViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    // Pre-fill topic if passed from navigation
    LaunchedEffect(initialTopic) {
        if (initialTopic.isNotBlank() && state.topic.isBlank()) {
            viewModel.setTopic(initialTopic)
        }
    }

    if (state.isSetupMode) {
        DebateSetupScreen(viewModel = viewModel, onBack = onBack)
    } else {
        DebateChatScreen(viewModel = viewModel, onBack = onBack)
    }
}
