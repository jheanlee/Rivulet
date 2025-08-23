export const paths = {
  root: {
    root: {
      path: "/",
      getHref: () => "/",
    },
    home: {
      path: "",
      getHref: () => "/",
    },
    media: {
      root: {
        path: "media",
        getHref: () => "/media",
      },
      movies: {
        path: "/movies",
        getHref: () => "/media/movies",
      },
      videos: {
        path: "/videos",
        getHref: () => "/media/videos",
      },
      music: {
        path: "/music",
        getHref: () => "/media/music",
      },
    },
    login: {
      path: "login",
      getHref: () => "/login",
    },
  },
  playback: {
    path: "/playback/:playbackId",
    getHref: (id: string) => `/playback/${id}`,
  },
};
