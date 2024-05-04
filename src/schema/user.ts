import { z } from "zod";

const ROLE = ["ADMIN", "AGENT_DRIVER", "AGENT", "ADVERTISER"] as const;

export const SignUpSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  country: z.string(),
  zipCode: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  role: z.enum(ROLE),
});
