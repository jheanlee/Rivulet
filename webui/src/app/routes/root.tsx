import { Navbar } from "@/components/layouts/navbar.tsx";
import { Outlet } from "react-router";

export const Root = () => {
  return (
    <div className="w-screen h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
};
