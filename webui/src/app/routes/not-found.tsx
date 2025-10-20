import { Button } from "@/components/ui/button.tsx";
import { NavLink } from "react-router";
import { paths } from "@/config/paths.ts";

export const NotFound = () => {
  return (
    <div className="h-full w-full mt-10 flex flex-col items-center font-semibold">
      <h1>404 - Not Found</h1>
      <p>The page requested does not exist.</p>
      <Button variant="link" className="mt-5" asChild>
        <NavLink to={paths.root.home.getHref()}>Return to homepage</NavLink>
      </Button>
    </div>
  );
};
