import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import ToggleThemeButton from "@/components/theme/toggle-theme.tsx";
import { paths } from "@/config/paths.ts";
import { NavLink } from "react-router";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export const NavSidebar = () => {
  return (
    <div className="hidden max-md:block">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>{/* TODO: Icon */}</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key="home">
                  <SidebarMenuButton asChild>
                    <NavLink to={paths.root.home.getHref()}>Home</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key="music">
                  <SidebarMenuButton asChild>
                    <NavLink to={paths.root.media.music.getHref()}>
                      Music
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key="video">
                  <SidebarMenuButton asChild>
                    <NavLink to={paths.root.media.videos.getHref()}>
                      Video
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key="movie">
                  <SidebarMenuButton asChild>
                    <NavLink to={paths.root.media.movies.getHref()}>
                      Movie
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-between align-middle gap-2">
              <SidebarMenuButton className="gap-0 p-0" asChild>
                <NavLink
                  to={paths.root.login.getHref()}
                  className="h-max w-auto"
                >
                  <Button size="icon" variant="ghost">
                    <LogIn />
                  </Button>
                </NavLink>
              </SidebarMenuButton>

              <ToggleThemeButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};
