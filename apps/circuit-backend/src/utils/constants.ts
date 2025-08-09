import { UserSettings } from '@circuit/protocol';

export const UDSC_CONTRACT_ADDRESS = '';
export const USDC_TEN_CENTS = '100000';

// default settings
export const DEFAULT_MIN_NEYNAR_SCORE = 0.2;
export const DEFAULT_FOLLOWER_SETTING = true;
export const DEFAULT_FOLLOWING_SETTING = false;
export const DEFAULT_POST_PAYOUT_LIMIT = -1;
export const DEFAULT_ONE_PAYOUT_PER_POST = false;
export const DEFAULT_TIPS_ON = false;

export const DEFAULT_USER_SETTINGS: UserSettings = {
    interactionSettings: {
        likeSetting: { isOn: true, amount: USDC_TEN_CENTS },
        recastSetting: { isOn: true, amount: USDC_TEN_CENTS },
        commentSetting: { isOn: true, amount: USDC_TEN_CENTS },
        quoteSetting: { isOn: true, amount: USDC_TEN_CENTS },
        followSetting: { isOn: true, amount: USDC_TEN_CENTS },
    },
    tipSettings: {
        tipsOn: DEFAULT_TIPS_ON,
        tipToken: UDSC_CONTRACT_ADDRESS,
        minScore: DEFAULT_MIN_NEYNAR_SCORE,
        followersOnly: DEFAULT_FOLLOWER_SETTING,
        followingOnly: DEFAULT_FOLLOWING_SETTING,
        postPayoutLimit: DEFAULT_POST_PAYOUT_LIMIT,
        onePayoutPerPost: DEFAULT_ONE_PAYOUT_PER_POST,
    },
}