import { describe, expect, it, beforeEach } from 'vitest';
import { route } from '../src/router.js';
import { FakeWS, lastMsg, printLastMsg, setupTestRouter } from './helpers.js';
import { DEFAULT_USER_SETTINGS } from '../src/utils/constants.js';

let ctx: any;
beforeEach(() => {
  ({ ctx } = setupTestRouter());
});

describe('router', () => {
  it('rejects invalid json', async () => {
    const ws = new FakeWS();
    await route(ws as any, '{bad', ctx);
    expect(ws.send).toHaveBeenCalled();
    const msg = lastMsg(ws);
    expect(msg.type).toBe('json-parse-error');
  });

  it('routes user login', async () => {
    const ws = new FakeWS();
    await route(ws as any, JSON.stringify({ type: 'user.login', fid: 1 }), ctx);
    expect(lastMsg(ws)).toEqual({ type: 'user.login:ack', fid: 1 });
  });

  it('gets user settings (default)', async () => {
    const ws = new FakeWS();
    await route(ws as any, JSON.stringify({ type: 'user.settings.get', fid: 1 }), ctx);
    expect(lastMsg(ws)).toEqual({ type: 'user.settings.get:ack', fid: 1, settings: DEFAULT_USER_SETTINGS });
  });

  it('sets then gets user settings (via real service)', async () => {
    const ws = new FakeWS();

    const settings = {
      interactionSettings: {
        likeSetting: { isOn: true, amount: '10000' },
        recastSetting: { isOn: true, amount: '10000' },
        commentSetting: { isOn: true, amount: '10000' },
        quoteSetting: { isOn: true, amount: '10000' },
        followSetting: { isOn: true, amount: '10000' },
      },
      tipSettings: { tipToken: '0xabc', minScore: 0.5, followersOnly: true },
    };

    // set
    await route(ws as any, JSON.stringify({
      type: 'user.settings.set',
      fid: 42,
      settings
    }), ctx);
    const setAck = lastMsg(ws);
    expect(setAck.type).toBe('user.settings.set:ack');
    expect(setAck.fid).toBe(42);
    expect(setAck.success).toEqual(true);

    // get
    await route(ws as any, JSON.stringify({ type: 'user.settings.get', fid: 42 }), ctx);
    const getAck = lastMsg(ws);
    expect(getAck.settings).toEqual(settings);
  });
});