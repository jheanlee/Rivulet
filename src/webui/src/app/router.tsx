import { createBrowserRouter, RouterProvider } from "react-router";
import { paths } from "@/config/paths.ts";
import Root from "@/app/routes/root.tsx";
import Home from "@/app/routes/home.tsx";
import NotFound from "@/app/routes/not-found.tsx";

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.root.root.path,
      Component: Root,
      children: [
        {
          path: paths.root.home.path,
          Component: Home,
        },
        {
          path: "*",
          Component: NotFound,
        },
      ],
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
