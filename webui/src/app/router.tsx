import { createBrowserRouter, RouterProvider } from "react-router";
import { paths } from "@/config/paths.ts";
import { Root } from "@/app/routes/root.tsx";

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.root.root.path,
      Component: Root,
      hydrateFallbackElement: <div>Loading...</div>,
      children: [
        {
          path: paths.root.home.path,
          lazy: async () => {
            let { Home } = await import("@/app/routes/home");
            return { Component: Home };
          },
        },
        {
          path: paths.root.media.wrapper.path,
          lazy: async () => {
            let { MediaWrapper } = await import("@/app/routes/media/root");
            return { Component: MediaWrapper };
          },
        },
        {
          path: paths.root.login.path,
          lazy: async () => {
            let { Login } = await import("@/app/routes/login");
            return { Component: Login };
          },
        },
        {
          path: "*",
          lazy: async () => {
            let { NotFound } = await import("@/app/routes/not-found");
            return { Component: NotFound };
          },
        },
      ],
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
