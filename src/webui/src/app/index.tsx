import { AppRouter } from "@/app/router.tsx";
import { ThemeProvider } from "@/components/theme/theme-provider.tsx";

export const App = () => {
  return (
    <>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </>
  );
};
