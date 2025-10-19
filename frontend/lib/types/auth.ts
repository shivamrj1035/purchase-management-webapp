export interface User {
  userId: string
  email: string
  username: string
  phoneNumber?: string
  homeAddress?: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
  phoneNumber?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: User
  }
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}
