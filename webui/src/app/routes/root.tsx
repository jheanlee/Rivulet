import { Navbar } from "@/components/layouts/navbar.tsx";
import { Outlet } from "react-router";
import { NavSidebar } from "@/components/layouts/nav-sidebar.tsx";
import { useSidebar } from "@/components/ui/sidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Menu } from "lucide-react";

export const Root = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-screen h-screen">
      <Button
        className="hidden max-md:block fixed bottom-8 right-8"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
      <Navbar />
      <NavSidebar />
      <Outlet />
    </div>
  );
};
