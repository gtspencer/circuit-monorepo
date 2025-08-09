import { z } from 'zod';

// schemas (vs types) are part of the public/external protocol

// user settings schemas
export const BaseInteractionSettingSchema = z.object({
  isOn: z.boolean(),
  amount: z.string(),
});
export type BaseInteractionSetting = z.infer<typeof BaseInteractionSettingSchema>;

export const InteractionSettingsSchema = z.object({
  likeSetting: BaseInteractionSettingSchema,
  recastSetting: BaseInteractionSettingSchema,
  commentSetting: BaseInteractionSettingSchema,
  quoteSetting: BaseInteractionSettingSchema,
  followSetting: BaseInteractionSettingSchema,
});
export type InteractionSettings = z.infer<typeof InteractionSettingsSchema>;

export const TipSettingsSchema = z.object({
  tipsOn: z.boolean(),
  tipToken: z.string(),
  minScore: z.number(),
  followersOnly: z.boolean(),
  followingOnly: z.boolean(),
  // only first x engagements get rewarded
  postPayoutLimit: z.number(),
  // 1 payout per person per post (like + recast only gets 1 payout)
  onePayoutPerPost: z.boolean(),
});
export type TipSettings = z.infer<typeof TipSettingsSchema>;

// don't need these here, but maybe good to keep a shared schemas?
// will need this for web hook receiver
// export const TipSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   token: z.string(),
//   amount: z.bigint(),
// });

// export const TipStatsSchema = z.object({
//   outgoing: z.array(TipSchema),
//   incoming: z.array(TipSchema),
// });

export const UserSettingsSchema = z.object({
  interactionSettings: InteractionSettingsSchema,
  tipSettings: TipSettingsSchema,
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;