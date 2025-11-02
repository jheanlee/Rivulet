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
      wrapper: {
        path: "media/:mediaType",
      },
      music: {
        path: "media/music",
        getHref: () => "/media/music",
      },
      movies: {
        path: "media/movies",
        getHref: () => "/media/movies",
      },
      videos: {
        path: "media/videos",
        getHref: () => "/media/videos",
      },
    },
    login: {
      path: "login",
      getHref: () => "/login",
    },
    notFound: {
      path: "not-found",
      getHref: () => "/not-found",
    },
  },
  playback: {
    path: "/playback/:playbackId",
    getHref: (id: string) => `/playback/${id}`,
  },
};
