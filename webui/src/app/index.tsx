import { AppRouter } from "@/app/router.tsx";
import { ThemeProvider } from "@/components/theme/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";

export const App = () => {
  return (
    <>
      <ThemeProvider>
        <SidebarProvider>
          <AppRouter />
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
};
