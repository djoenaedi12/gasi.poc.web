import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAppStore } from '@gasi/core-starter';
import { authService, tokenStore } from '../services/authService';
import type { LoginFormData } from '../schemas/loginSchema';

export function useLogin() {
  const navigate   = useNavigate();
  const setSession = useAppStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      // 1. Login → dapat token
      const tokens = await authService.login({
        username:  data.username,
        password:  data.password,
        grantType: 'password',
      });

      // 2. Simpan token di memory
      tokenStore.set(tokens.accessToken, tokens.refreshToken);

      // 3. Ambil session data
      const session = await authService.me();
      return session;
    },
    onSuccess: (session) => {
      setSession(session);
      navigate('/');
    },
  });
}
