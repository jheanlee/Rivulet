import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import "react-day-picker/style.css";
import { Textarea } from "@/components/ui/textarea.tsx";
import { newItem } from "@/services/media/item-actions.ts";
import { toast } from "sonner";
import { useUpdateStore } from "@/store/upload.ts";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useState } from "react";
import { musicSchema } from "@/form-schemas/media-metadata.ts";

interface UploadMusicFormProps {
  onExit: () => void;
}

export const UploadMusicForm = ({ onExit }: UploadMusicFormProps) => {
  const form = useForm<z.infer<typeof musicSchema>>({
    resolver: zodResolver(musicSchema),
    defaultValues: {
      title: "",
      artists: "",
      genres: "",
      language: "",
      region: "",
      album: "",
      disk_number: undefined,
      track_number: undefined,
      release_date_year: undefined,
      release_date_month: undefined,
      release_date_day: undefined,
      year: undefined,
      description: "",
      video_id: "",
      file: undefined,
      filename: undefined,
    },
  });

  const updateStore = useUpdateStore();

  const onSubmit = async (values: z.infer<typeof musicSchema>) => {
    if (updateStore.uploadActive) {
      toast.error(
        "Another upload is in progress. Please wait for it to finish first",
      );
    } else if (values.file === undefined) {
      toast.error("Please select a file");
    } else {
      void newItem({
        upload: { type: "music", data: values },
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
          <FieldLegend>Upload music</FieldLegend>
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
              name="artists"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Artists</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Artist1,Artist2"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Names of the artist(s), seperated by commas (,)
                  </FieldDescription>
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
                    placeholder="Genre1,Genre2"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Genre(s) of the music, seperated by commas (,)
                  </FieldDescription>
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
              name="album"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Album</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Album"
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
              name="disk_number"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Disk #</FieldLabel>
                  <Input
                    type="number"
                    placeholder="1"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      form.setValue(
                        "disk_number",
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
              name="track_number"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Track #</FieldLabel>
                  <Input
                    type="number"
                    placeholder="1"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      form.setValue(
                        "track_number",
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
                    placeholder="2025"
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
              name="video_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Video Id</FieldLabel>
                  <Input
                    type="text"
                    placeholder="some_example_video-id"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    The 21-character id of the music video (leave empty for
                    none)
                  </FieldDescription>
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
                    accept="audio0/*"
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
