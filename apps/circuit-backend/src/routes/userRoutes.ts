import type { RouteEntry } from '../types.js';
import type {
  UserLoginMsg,
  UserGetSettingsMsg,
  UserSetSettingsMsg,
  UserSettings
} from '@circuit/protocol';
import type { SettingsService } from '../services/index.js';

export function userLoginRoute(): RouteEntry<UserLoginMsg>[] {
  return [
    ['user.login', async (ws, msg) => {
      ws.send(JSON.stringify({ type: 'user.login:ack', fid: msg.fid }));
    }]
  ];
}

export function userSetSettingsRoute(deps: { settingsService: SettingsService }): RouteEntry<UserSetSettingsMsg>[] {
  const { settingsService } = deps;

  return [
    ['user.settings.set', async (ws, msg) => {
      const patch = (msg as any).settings as Partial<UserSettings> | undefined;

      try {
        const updated = await settingsService.update(msg.fid, patch ?? {});
        if (updated) {
          ws.send(JSON.stringify({ type: 'user.settings.set:ack', fid: msg.fid, success: true }));
          return;
        }

        ws.send(JSON.stringify({ type: 'user.settings.set:ack', fid: msg.fid, success: false }));
      } catch {
        ws.send(JSON.stringify({ type: 'user.settings.set:ack', fid: msg.fid, success: false }));
      }
    }],
  ];
}

export function userGetSettingsRoute(deps: { settingsService: SettingsService }): RouteEntry<UserGetSettingsMsg>[] {
  const { settingsService } = deps;

  return [
    ['user.settings.get', async (ws, msg) => {
      const settings = await settingsService.get(msg.fid);
      ws.send(JSON.stringify({ type: 'user.settings.get:ack', fid: msg.fid, settings }));
    }],
  ];
}