export interface LoginRequest {
  username:  string;
  password:  string;
  grantType: 'password';
}

export interface TokenResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    'Bearer';
}

export interface RefreshRequest {
  refreshToken: string;
}
