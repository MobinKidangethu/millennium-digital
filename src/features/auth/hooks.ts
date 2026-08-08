import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/state';
import * as service from './service';
import type { RegisterInput } from './service';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      service.login(email, password, 'buyer'),
    onSuccess: setSession,
  });
}

export function useAdminLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      service.login(email, password, 'admin'),
    onSuccess: setSession,
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => service.register(input),
    onSuccess: setSession,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => service.requestPasswordReset(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) =>
      service.resetPassword(email, newPassword),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return logout;
}
