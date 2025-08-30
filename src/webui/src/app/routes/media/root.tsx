export interface MediaProp {
  media_type: "music" | "movies" | "videos";
}

export const Media = ({ media_type }: MediaProp) => {
  return (
    <div className={"Flex px-12 py-4"}>
      <h2 className={"text-2xl font-semibold text-transform: capitalize"}>
        {media_type}
      </h2>
    </div>
  );
};
