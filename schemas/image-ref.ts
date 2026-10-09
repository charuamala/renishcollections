import { z } from "zod";

/** An image reference: a Cloudinary/remote URL, or a path to a photo shipped with the site under /public (e.g. /images/…). */
export const imageRefSchema = z
  .string()
  .trim()
  .refine((v) => v.startsWith("/") || z.url().safeParse(v).success, "Enter a valid image URL");
