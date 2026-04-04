import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newItem } from "@/services/media/item-actions.ts";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { useUpdateStore } from "@/store/upload.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { videoSchema } from "@/form-schemas/media-metadata.ts";

interface UploadVideoFormProps {
  onExit: () => void;
}

const UploadVideoForm = ({ onExit }: UploadVideoFormProps) => {
  const form = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      creator: "",
      categories: "",
      language: "",
      region: "",
      description: "",
      file: undefined,
      filename: undefined,
    },
  });

  const updateStore = useUpdateStore();

  const onSubmit = async (values: z.infer<typeof videoSchema>) => {
    if (updateStore.uploadActive) {
      toast.error(
        "Another upload is in progress. Please wait for it to finish first",
      );
    } else if (values.file === undefined) {
      toast.error("Please select a file");
    } else {
      void newItem({
        upload: { type: "video", data: values },
      });
      onExit();
    }
  };

  return (
    <div className="w-full h-full flex justify-center content-center">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full flex"
      >
        <FieldSet className="w-full h-full flex">
          <FieldLegend>Upload video</FieldLegend>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Title"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="creator"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Creator</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Creator"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="categories"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Categories</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Category1,Category2"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Language</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Rust"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="region"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Region</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Somewhere, Earth"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    placeholder="Description"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="file"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>File</FieldLabel>
                  <Input
                    type="file"
                    accept="video/*"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      form.setValue("file", event.target.files?.[0]);
                      form.setValue("filename", event.target.files?.[0].name);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={onExit}>
                Cancel
              </Button>
              <Field>
                <Button type="submit">Submit</Button>
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};
export default UploadVideoForm;
