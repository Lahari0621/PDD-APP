package com.aidebatepartner.app.presentation.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.aidebatepartner.app.presentation.screens.auth.ForgotPasswordScreen
import com.aidebatepartner.app.presentation.screens.auth.LoginScreen
import com.aidebatepartner.app.presentation.screens.auth.RegisterScreen
import com.aidebatepartner.app.presentation.screens.dashboard.DashboardScreen
import com.aidebatepartner.app.presentation.screens.debate.DebateScreen
import com.aidebatepartner.app.presentation.screens.history.HistoryScreen
import com.aidebatepartner.app.presentation.screens.home.HomeScreen
import com.aidebatepartner.app.presentation.screens.learn.LearnScreen
import com.aidebatepartner.app.presentation.screens.analytics.AnalyticsScreen
import com.aidebatepartner.app.presentation.screens.onboarding.OnboardingScreen
import com.aidebatepartner.app.presentation.screens.profile.ProfileScreen
import com.aidebatepartner.app.presentation.screens.splash.SplashScreen
import com.aidebatepartner.app.presentation.viewmodel.AuthViewModel

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Login : Screen("login")
    object Register : Screen("register")
    object ForgotPassword : Screen("forgot_password")
    object Home : Screen("home")
    object Dashboard : Screen("dashboard")
    object Debate : Screen("debate?topic={topic}") {
        fun withTopic(topic: String = "") = "debate?topic=$topic"
    }
    object Learn : Screen("learn")
    object Analytics : Screen("analytics")
    object Profile : Screen("profile")
    object History : Screen("history")
}

@Composable
fun AppNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel
) {
    val authState by authViewModel.uiState.collectAsState()
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        enterTransition = {
            fadeIn(animationSpec = tween(300)) + slideInHorizontally(
                animationSpec = tween(300),
                initialOffsetX = { it / 4 }
            )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(300)) + slideOutHorizontally(
                animationSpec = tween(300),
                targetOffsetX = { -it / 4 }
            )
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(300)) + slideInHorizontally(
                animationSpec = tween(300),
                initialOffsetX = { -it / 4 }
            )
        },
        popExitTransition = {
            fadeOut(animationSpec = tween(300)) + slideOutHorizontally(
                animationSpec = tween(300),
                targetOffsetX = { it / 4 }
            )
        }
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigate = { isAuthenticated ->
                    if (isAuthenticated) {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    } else {
                        navController.navigate(Screen.Onboarding.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                },
                isLoggedIn = isLoggedIn
            )
        }

        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onGetStarted = {
                    navController.navigate(Screen.Register.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                onLogin = { navController.navigate(Screen.Login.route) }
            )
        }

        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onForgotPassword = { navController.navigate(Screen.ForgotPassword.route) }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = authViewModel,
                onRegisterSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.navigate(Screen.Login.route) }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                viewModel = authViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                authViewModel = authViewModel,
                onStartDebate = { topic ->
                    navController.navigate(Screen.Debate.withTopic(topic))
                },
                onNavigateToLearn = { navController.navigate(Screen.Learn.route) },
                onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                onNavigateToHistory = { navController.navigate(Screen.History.route) },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Screen.Onboarding.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.Debate.route,
            enterTransition = {
                slideInVertically(animationSpec = tween(400), initialOffsetY = { it }) +
                fadeIn(animationSpec = tween(400))
            },
            exitTransition = {
                slideOutVertically(animationSpec = tween(400), targetOffsetY = { it }) +
                fadeOut(animationSpec = tween(400))
            }
        ) { backStackEntry ->
            val topic = backStackEntry.arguments?.getString("topic") ?: ""
            DebateScreen(
                initialTopic = topic,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Learn.route) {
            LearnScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Analytics.route) {
            AnalyticsScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Screen.Onboarding.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.History.route) {
            HistoryScreen(
                onBack = { navController.popBackStack() },
                onStartDebate = { topic ->
                    navController.navigate(Screen.Debate.withTopic(topic))
                }
            )
        }
    }
}
