import axios from "axios";
import { refreshToken } from "@/services/auth.ts";
import { paths } from "@/config/paths.ts";
import { Buffer } from "buffer";
import { toast } from "sonner";

// public fetcher (login & refresh token)
export const publicFetcher = axios.create();

// cron job (automatic api calls)
export const cronFetcher = axios.create();

cronFetcher.interceptors.request.use(async (config) => {
  const access_token = localStorage.getItem("rivulet.access_token");
  if (access_token === null) {
    window.location.href = paths.root.login.getHref();
    toast.error("Login required");
    return config;
  }

  cronFetcher.defaults.headers["Authorization"] = access_token;
  if (
    JSON.parse(
      Buffer.from(access_token.split(".")[1], "base64").toString("ascii"),
    ).exp <
    Date.now() / 1000
  ) {
    window.location.href = paths.root.login.getHref();
    toast.error("Session expired");
    return config;
  }
  return config;
});

// private fetcher (user conducted api calls)
export const fetcher = axios.create();

fetcher.interceptors.request.use(async (config) => {
  const access_token = localStorage.getItem("rivulet.access_token");
  if (access_token === null) {
    window.location.href = paths.root.login.getHref();
    toast.error("Login required");
    return config;
  }

  fetcher.defaults.headers["Authorization"] = access_token;
  if (
    JSON.parse(
      Buffer.from(access_token.split(".")[1], "base64").toString("ascii"),
    ).exp <
    Date.now() / 1000 + 300
  ) {
    const res = await refreshToken();
    if (res !== 200) {
      window.location.href = paths.root.login.getHref();
      toast.error("Session expired");
      return config;
    }
  }
  return config;
});
