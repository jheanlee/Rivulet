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
        path: "media/movie",
        getHref: () => "/media/movie",
      },
      videos: {
        path: "media/video",
        getHref: () => "/media/video",
      },
    },
    mediaInfo: {
      path: "media-info/:mediaId",
      getHref: (id: string) => `/media-info/${id}`,
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
