import { z } from "zod";

const LISTING_SIZES = [
  "graine",
  "tubercule",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
] as const;

export const listingFormSchema = z.object({
  species_name: z.string().min(1, "Choisis une espèce"),
  species_id: z.number().nullable(),
  size: z.enum(LISTING_SIZES, {
    error: "Choisis une taille",
  }),
  photos: z
    .array(z.instanceof(File))
    .max(5, "5 photos maximum"),
  description: z.string().max(500, "500 caractères maximum"),
  address_city: z.string().min(1, "Indique une ville"),
  address_lat: z.number(),
  address_lng: z.number(),
});

export type ListingFormData = z.infer<typeof listingFormSchema>;
