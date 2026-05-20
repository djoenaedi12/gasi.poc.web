import { zodResolver } from '@hookform/resolvers/zod';
import { useForm }     from 'react-hook-form';
import { GalleryVerticalEnd } from 'lucide-react';
import { FormButton, FormInput, cn } from '@gasi/core-ui';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useLogin } from '../hooks/useLogin';

function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const login = useLogin();
  const form  = useForm<LoginFormData>({
    resolver:      zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => login.mutate(data);

  const errorMessage = login.error
    ? (login.error as any)?.response?.data?.message ?? 'Login gagal. Periksa kembali username dan password.'
    : null;

  return (
    <form
      className={cn('flex flex-col gap-5', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan username dan password untuk melanjutkan
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <FormInput
        form={form}
        name="username"
        label="Username"
        type="text"
        placeholder="john.doe"
        required
      />

      <FormInput
        form={form}
        name="password"
        label="Password"
        type="password"
        required
      />

      <FormButton
        className="w-full"
        loading={form.formState.isSubmitting || login.isPending}
        loadingText="Masuk..."
      >
        Masuk
      </FormButton>
    </form>
  );
}

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="relative hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-5" />
          </div>
          GASI Platform
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium lg:hidden">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            GASI Platform
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
