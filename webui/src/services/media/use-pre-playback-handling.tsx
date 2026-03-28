import { useNavigate } from "react-router";
import { requestServe } from "@/services/media/serve.ts";
import { toast } from "sonner";
import { paths } from "@/config/paths.ts";
import { useEffect, useState } from "react";

interface UsePrePlaybackHandlingProps {
  id: string;
}
export const usePrePlaybackHandling = ({ id }: UsePrePlaybackHandlingProps) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [hasHandled, setHasHandled] = useState<boolean>(false);

  useEffect(() => {
    if (hasHandled) return;
    let shouldHandle = true;

    (async () => {
      if (shouldHandle) {
        const serveRes = await requestServe({ id });
        setHasHandled(true);

        if (typeof serveRes === "string") {
          setToken(serveRes);
        } else {
          switch (serveRes) {
            case 401: {
              toast.error("Session expired");
              navigate(paths.root.login.getHref());
              break;
            }
            case 403: {
              toast.error("Access denied");
              break;
            }
            case 404: {
              navigate(paths.root.notFound.getHref());
              break;
            }
            case 500: {
              toast.error("Unable to connect to server");
              break;
            }
            default: {
              toast.error(`An error has occurred. Error code: ${serveRes}`);
            }
          }
        }
      }
    })();

    return () => {
      shouldHandle = false;
    };
  }, [hasHandled, id, navigate]);

  return { token };
};
