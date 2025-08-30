import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "../ui/button";

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSummit = (values: z.infer<typeof formSchema>) => {
    //TODO
    console.log(values);
  };

  return (
    <div className="w-full h-full flex justify-center content-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSummit)}
          className="w-100 h-70 mt-20 flex flex-col gap-4 content-center"
        >
          <FormField
            control={form.control}
            name={"username"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="user" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"password"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};
