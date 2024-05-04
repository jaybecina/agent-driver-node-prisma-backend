import { z } from "zod";

export const DriverSchema = z.object({
  dl: z.string(),
  lp: z.string(),
  driveHours: z.string(),
  ssn: z.string(),
  preferredLoc: z.string(),
  dateRegistered: z.string(),
});
