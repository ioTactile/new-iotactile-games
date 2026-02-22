"use client";

import { loginFormSchema, type LoginFormValues } from "@/lib/auth-schema";
import { useZodForm } from "@/hooks/use-zod-form";
import { Form } from "@/components/zod/zod-form";
import { Input } from "@/components/ui/input";
import { ZodFormField } from "@/components/zod/zod-form-field";
import { PasswordInput } from "@/components/inputs/password-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  defaultEmail?: string;
}

export function LoginForm({
  onSwitchToRegister,
  defaultEmail,
}: LoginFormProps) {
  const form = useZodForm(loginFormSchema, {
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
    },
  });

  const { loginMutation } = useAuth();
  const { isPending, isError, error } = loginMutation;

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <Form
      form={form}
      schema={loginFormSchema}
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <ZodFormField form={form} name="email" label="Email">
        {(field) => (
          <Input
            placeholder="vous@exemple.com"
            autoComplete="email"
            {...field}
          />
        )}
      </ZodFormField>

      <ZodFormField form={form} name="password" label="Mot de passe">
        {(field) => (
          <PasswordInput
            placeholder="********"
            autoComplete="current-password"
            {...field}
          />
        )}
      </ZodFormField>

      {isError && <p className="text-sm text-destructive">{error.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Connexion…" : "Se connecter"}
      </Button>

      {onSwitchToRegister && (
        <Button type="button" variant="link" onClick={onSwitchToRegister}>
          Créer un compte
        </Button>
      )}
    </Form>
  );
}
