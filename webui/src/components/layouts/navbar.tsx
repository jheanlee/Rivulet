import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.tsx";
import { NavLink } from "react-router";
import { paths } from "@/config/paths.ts";
import ToggleThemeButton from "@/components/theme/toggle-theme.tsx";
import { Button } from "@/components/ui/button.tsx";

export const Navbar = () => {
  return (
    <div className="hidden md:flex w-full flex-row justify-between p-3">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <NavLink to={paths.root.home.getHref()}>Home</NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <NavLink to={paths.root.media.music.getHref()}>Music</NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <NavLink to={paths.root.media.videos.getHref()}>Video</NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <NavLink to={paths.root.media.movies.getHref()}>Movie</NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex align-middle gap-2">
        <Button asChild>
          <NavLink to={paths.root.login.getHref()}>Login</NavLink>
        </Button>
        <ToggleThemeButton />
      </div>
    </div>
  );
};
