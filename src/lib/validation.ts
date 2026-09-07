import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ange en giltig e-postadress"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
  displayName: z.string().trim().min(2, "Namnet är för kort").max(50),
  birthDate: z.coerce.date({ error: "Ange ett giltigt födelsedatum" }),
  gender: z.enum(["WOMAN", "MAN", "NONBINARY", "OTHER"]),
  seekingGender: z
    .array(z.enum(["WOMAN", "MAN", "NONBINARY", "OTHER"]))
    .min(1, "Välj minst ett alternativ"),
  consentSpecialCategory: z.literal(true, {
    error: "Du måste godkänna det här för att kunna matchas med andra medlemmar",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
