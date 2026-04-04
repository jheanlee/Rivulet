import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useState } from "react";
import { newItem } from "@/services/media/item-actions.ts";
import { toast } from "sonner";
import { useUpdateStore } from "@/store/upload.ts";
import { movieSchema } from "@/form-schemas/media-metadata.ts";

interface UploadMovieFormProps {
  onExit: () => void;
}

export const UploadMovieForm = ({ onExit }: UploadMovieFormProps) => {
  const form = useForm<z.infer<typeof movieSchema>>({
    resolver: zodResolver(movieSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      director: "",
      cast: "",
      genres: "",
      language: "",
      region: "",
      release_date_year: undefined,
      release_date_month: undefined,
      release_date_day: undefined,
      year: undefined,
      description: "",
      file: undefined,
      filename: undefined,
    },
  });

  const updateStore = useUpdateStore();

  const onSubmit = async (values: z.infer<typeof movieSchema>) => {
    if (updateStore.uploadActive) {
      toast.error(
        "Another upload is in progress. Please wait for it to finish first",
      );
    } else if (values.file === undefined) {
      toast.error("Please select a file");
    } else {
      void newItem({
        upload: { type: "movie", data: values },
      });
      onExit();
    }
  };

  const [releaseDateInvalid, setReleaseDateInvalid] = useState<boolean>(false);
  const checkReleaseDate = () => {
    const values = form.getValues([
      "release_date_year",
      "release_date_month",
      "release_date_day",
    ]);
    const date = new Date(`${values[0]}-${values[1] ?? 1 - 1}-${values[2]}`);
    setReleaseDateInvalid(
      (values[0] !== undefined ||
        values[1] !== undefined ||
        values[2] !== undefined) &&
        (values[0] === undefined ||
          values[1] === undefined ||
          values[2] === undefined ||
          date.getFullYear() !== values[0] ||
          date.getMonth() + 1 !== values[1] ||
          date.getDate() !== values[2]),
    );
  };

  return (
    <div className="w-full h-full flex justify-center content-center">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full flex"
      >
        <FieldSet className="w-full h-full flex">
          <FieldLegend>Upload movie</FieldLegend>
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
              name="director"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Director</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Director"
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
              name="cast"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cast</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Cast1,Cast2"
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
              name="genres"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Genres</FieldLabel>
                  <Input
                    type="text"
                    placeholder="genre1,genre2"
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
            <FieldSet className="gap-3" data-invalid={releaseDateInvalid}>
              <FieldLabel>Release Date</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                <Controller
                  name="release_date_year"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        type="number"
                        placeholder="Year"
                        aria-invalid={fieldState.invalid}
                        onChange={(event) => {
                          form.setValue(
                            "release_date_year",
                            event.target.value.length === 0
                              ? undefined
                              : parseInt(event.target.value),
                          );

                          checkReleaseDate();
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="release_date_month"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Select
                        onValueChange={(event) => {
                          form.setValue(
                            "release_date_month",
                            event.length === 0 || event === " "
                              ? undefined
                              : parseInt(event),
                          );

                          checkReleaseDate();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">(Blank)</SelectItem>
                          <SelectItem value="1">Jan</SelectItem>
                          <SelectItem value="2">Feb</SelectItem>
                          <SelectItem value="3">Mar</SelectItem>
                          <SelectItem value="4">Apr</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">Jun</SelectItem>
                          <SelectItem value="7">Jul</SelectItem>
                          <SelectItem value="8">Aug</SelectItem>
                          <SelectItem value="9">Sep</SelectItem>
                          <SelectItem value="10">Oct</SelectItem>
                          <SelectItem value="11">Nov</SelectItem>
                          <SelectItem value="12">Dec</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="release_date_day"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Select
                        onValueChange={(event) => {
                          form.setValue(
                            "release_date_day",
                            event.length === 0 || event === " "
                              ? undefined
                              : parseInt(event),
                          );

                          checkReleaseDate();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">(Blank)</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="11">11</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="13">13</SelectItem>
                          <SelectItem value="14">14</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="16">16</SelectItem>
                          <SelectItem value="17">17</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                          <SelectItem value="19">19</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="21">21</SelectItem>
                          <SelectItem value="22">22</SelectItem>
                          <SelectItem value="23">23</SelectItem>
                          <SelectItem value="24">24</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="26">26</SelectItem>
                          <SelectItem value="27">27</SelectItem>
                          <SelectItem value="28">28</SelectItem>
                          <SelectItem value="29">29</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="31">31</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              {releaseDateInvalid && <FieldError>Invalid date</FieldError>}
            </FieldSet>
            <Controller
              name="year"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Year</FieldLabel>
                  <Input
                    type="number"
                    placeholder="Year"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      form.setValue(
                        "year",
                        event.target.value.length === 0
                          ? undefined
                          : parseInt(event.target.value),
                      );
                    }}
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
                  <Input
                    type="text"
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
