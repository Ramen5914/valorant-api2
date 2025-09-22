import { z } from 'zod';

export const MapsResponse = z.object({
  status: z.literal(200),
  data: z.array(
    z.object({
      uuid: z.string(),
      mapUrl: z.string(),
    }),
  ),
});
