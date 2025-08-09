import { z } from 'zod';
import { UserSettingsSchema } from './userSchemas.js';

// === inbound message schemas (client -> server) ===
export const UserLogin = z.object({
    type: z.literal('user.login'),
    fid: z.number()
})
export type UserLoginMsg = z.infer<typeof UserLogin>;

export const UserGetSettings = z.object({
    type: z.literal('user.settings.get'),
    fid: z.number()
})
export type UserGetSettingsMsg = z.infer<typeof UserGetSettings>;

export const UserSetSettings = z.object({
    type: z.literal('user.settings.set'),
    fid: z.number(),
    settings: UserSettingsSchema,
})
export type UserSetSettingsMsg = z.infer<typeof UserSetSettings>;

// === outbound message schemas (client -> server) ===
export const UserLoginAck = z.object({
    type: z.literal('user.login:ack'),
    fid: z.number()
})
export type UserLoginAckMsg = z.infer<typeof UserLoginAck>;

// STOP FORGETTING TO ADD NEW MESSAGES HERE YOU IDIOT
export const ServerMsg = z.discriminatedUnion('type', [UserLogin, UserGetSettings, UserSetSettings]);
export type ServerMsgT = z.infer<typeof ServerMsg>;

export const ClientMsg = z.discriminatedUnion('type', [UserLoginAck]);
export type ClientMsgT = z.infer<typeof ClientMsg>;