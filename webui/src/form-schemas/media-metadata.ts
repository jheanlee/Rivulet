import { z } from "zod";
export const musicSchema = z.object({
  title: z
    .string()
    .normalize()
    .min(1, "Field required.")
    .max(256, "Field must not exceed 256 characters."),
  artists: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  genres: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  language: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  region: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  album: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  disk_number: z
    .number()
    .min(0)
    .max(256)
    .int("Field must be an integer.")
    .optional(),
  track_number: z
    .number()
    .min(0)
    .max(256)
    .int("Field must be an integer.")
    .optional(),
  release_date_year: z
    .number()
    .min(1900, "Field must be either empty or in the range of 1900-2100.")
    .max(2100, "Field must be either empty or in the range of 1900-2100.")
    .int("Field must be an integer.")
    .optional(),
  release_date_month: z
    .number()
    .min(1, "Field must be either empty or a valid month")
    .max(12, "Field must be either empty or a valid month")
    .int("Field must be an integer.")
    .optional(),
  release_date_day: z
    .number()
    .min(1, "Field must be either empty or a valid day")
    .max(31, "Field must be either empty or a valid day")
    .int("Field must be an integer.")
    .optional(),
  year: z.number().min(0).max(4096).int("Field must be an integer.").optional(),
  description: z
    .string()
    .normalize()
    .min(0)
    .max(1024, "Field must not exceed 1024 characters."),
  video_id: z.stringFormat("video id or empty", /^(?:[A-Za-z0-9_-]{21})?$/),
  file: z.file().optional(),
  filename: z.string().normalize().optional(),
});

export const videoSchema = z.object({
  title: z
    .string()
    .normalize()
    .min(1, "Field required.")
    .max(256, "Field must not exceed 256 characters."),
  creator: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  categories: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  language: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  region: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  description: z
    .string()
    .normalize()
    .min(0)
    .max(1024, "Field must not exceed 1024 characters."),
  file: z.file().optional(),
  filename: z.string().normalize().optional(),
});

export const movieSchema = z.object({
  title: z
    .string()
    .normalize()
    .min(1, "Field required.")
    .max(256, "Field must not exceed 256 characters."),
  director: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  cast: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  genres: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  language: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  region: z
    .string()
    .normalize()
    .min(0)
    .max(256, "Field must not exceed 256 characters."),
  release_date_year: z
    .number()
    .min(1900, "Field must be either empty or in the range of 1900-2100.")
    .max(2100, "Field must be either empty or in the range of 1900-2100.")
    .int("Field must be an integer.")
    .optional(),
  release_date_month: z
    .number()
    .min(1, "Field must be either empty or a valid month")
    .max(12, "Field must be either empty or a valid month")
    .int("Field must be an integer.")
    .optional(),
  release_date_day: z
    .number()
    .min(1, "Field must be either empty or a valid day")
    .max(31, "Field must be either empty or a valid day")
    .int("Field must be an integer.")
    .optional(),
  year: z
    .number()
    .min(1900, "Field must be either empty or in the range of 1900-2100.")
    .max(2100, "Field must be either empty or in the range of 1900-2100.")
    .int("Field must be an integer.")
    .optional(),
  description: z
    .string()
    .normalize()
    .min(0)
    .max(1024, "Field must not exceed 1024 characters."),
  file: z.file().optional(),
  filename: z.string().normalize().optional(),
});
