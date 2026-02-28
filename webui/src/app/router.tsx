import { createBrowserRouter, RouterProvider } from "react-router";
import { paths } from "@/config/paths.ts";
import { Root } from "@/app/routes/root.tsx";

const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.root.root.path,
      Component: Root,
      hydrateFallbackElement: <div>Loading...</div>,
      children: [
        {
          path: paths.root.home.path,
          lazy: async () => {
            const { Home } = await import("@/app/routes/home");
            return { Component: Home };
          },
        },
        {
          path: paths.root.media.wrapper.path,
          lazy: async () => {
            const { MediaWrapper } = await import("@/app/routes/media/root");
            return { Component: MediaWrapper };
          },
        },
        {
          path: paths.root.login.path,
          lazy: async () => {
            const { Login } = await import("@/app/routes/login");
            return { Component: Login };
          },
        },
        {
          path: "*",
          lazy: async () => {
            const { NotFound } = await import("@/app/routes/not-found");
            return { Component: NotFound };
          },
        },
      ],
    },
    {
      path: paths.playback.path,
      lazy: async () => {
        const { Playback } = await import("@/app/routes/playback");
        return { Component: Playback };
      },
    },
  ]);

export const AppRouter = () => {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
};
