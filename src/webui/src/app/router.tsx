import { createBrowserRouter, RouterProvider } from "react-router";
import { paths } from "@/config/paths.ts";
import Root from "@/app/routes/root.tsx";
import Home from "@/app/routes/home.tsx";
import NotFound from "@/app/routes/not-found.tsx";
import Login from "@/app/routes/login.tsx";
import { Media } from "@/app/routes/media/root.tsx";

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
          path: paths.root.media.music.path,
          Component: () => Media({ media_type: "music" }),
        },
        {
          path: paths.root.media.videos.path,
          Component: () => Media({ media_type: "videos" }),
        },
        {
          path: paths.root.media.movies.path,
          Component: () => Media({ media_type: "movies" }),
        },
        {
          path: paths.root.login.path,
          Component: Login,
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
