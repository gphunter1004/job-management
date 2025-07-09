import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { login, logout, getCurrentUser, refreshToken } from '@/store/slices/authSlice'
import type { LoginCredentials } from '@/types/auth'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken && !isAuthenticated && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated, user])

  // Set up token refresh
  useEffect(() => {
    if (!token || !isAuthenticated) return

    // Try to refresh token 5 minutes before expiry
    const refreshInterval = setInterval(() => {
      dispatch(refreshToken())
    }, 25 * 60 * 1000) // 25 minutes

    return () => clearInterval(refreshInterval)
  }, [token, isAuthenticated, dispatch])

  const loginUser = async (credentials: LoginCredentials) => {
    return dispatch(login(credentials))
  }

  const logoutUser = () => {
    dispatch(logout())
  }

  const refreshUserToken = () => {
    dispatch(refreshToken())
  }

  const fetchCurrentUser = () => {
    dispatch(getCurrentUser())
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginUser,
    logout: logoutUser,
    refreshToken: refreshUserToken,
    getCurrentUser: fetchCurrentUser,
  }
}