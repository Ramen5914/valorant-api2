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

export const MatchlistV4 = z.object({
  status: z.literal(200),
  data: z.array(
    z.object({
      metadata: z.object({
        match_id: z.guid(),
        map: z.object({
          id: z.guid(),
          name: z.string(),
        }),
        is_completed: z.boolean(),
        queue: z.object({
          id: z.string(),
          name: z.string(),
          mode_type: z.string(),
        }),
        season: z.object({
          id: z.guid(),
          short: z.string(),
        }),
      }),
    }),
  ),
});

export type MatchlistV4 = z.infer<typeof MatchlistV4>;

export const AccountV2 = z.object({
  status: z.literal(200),
  data: z.object({
    puuid: z.guid(),
    region: z.string(),
    account_level: z.int(),
    name: z.string(),
    tag: z.string(),
    card: z.guid(),
    title: z.guid(),
    platforms: z.array(z.string()),
    updated_at: z.iso.datetime(),
  }),
});

export type AccountV2 = z.infer<typeof AccountV2>;
