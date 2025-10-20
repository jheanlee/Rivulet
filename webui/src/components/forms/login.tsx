import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "../ui/button";
import { login } from "@/services/auth.ts";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths.ts";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field.tsx";
import { useState } from "react";

const formSchema = z.object({
  username: z
    .string()
    .min(4, {
      message: "Username must be at least 4 characters.",
    })
    .max(64, {
      message: "Username must not exceed 64 characters.",
    })
    .regex(/^[A-Za-z0-9_-]+$/, {
      message:
        "Username should only contain letters (A-Z, a-z), numbers (0-9), underscores (_) and hyphens (-).",
    }),

  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(256, {
      message: "Password must not exceed 256 characters.",
    })
    .regex(/^[A-Za-z0-9~!@#$%^&*()_\-+={}\[\]|\\:;,.\/]+$/, {
      message:
        "Password should only contain letters (A-Z, a-z), numbers (0-9) and symbols.",
    }),
});

export const LoginForm = () => {
  let navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState<number>(200);
  const getSubmitStatusMessage = () => {
    switch (submitStatus) {
      case 401:
        return "Incorrect username or password.";
      case 500:
        return "Unable to connect to server.";
      default:
        return `An error has occurred. Error code: ${submitStatus}`;
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let res = await login(values);
    setSubmitStatus(res);
    if (res === 200) {
      navigate(paths.root.home.getHref());
    }
  };

  return (
    <div className="w-full h-full flex justify-center content-center">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-100 h-70 mt-20 flex flex-col gap-4 content-center"
      >
        <FieldSet data-invalid={submitStatus !== 200}>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Username</FieldLabel>
                  <Input
                    type="text"
                    placeholder="user"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {submitStatus !== 200 && (
              <FieldError>{getSubmitStatusMessage()}</FieldError>
            )}
            <Field>
              <Button type="submit">Submit</Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};
