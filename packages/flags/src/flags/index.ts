import { env } from './buildInfo.js'

const testOnly = process.env.NODE_ENV === 'test'
const devOnly = process.env.NODE_ENV === 'development'
const prodOnly = process.env.NODE_ENV === 'production'
const insiderOnly = env.channel === 'insider' || devOnly
const betaOrInsiderOnly = insiderOnly || env.channel === 'beta'

export const flags = {
    mask_SDK_ready: betaOrInsiderOnly,
    support_testnet_switch: betaOrInsiderOnly,

    shadowRootInit: {
        mode:
            '__REACT_DEVTOOLS_GLOBAL_HOOK__' in globalThis || betaOrInsiderOnly || testOnly || process.env.MASK_APP
                ? 'open'
                : 'closed',
        delegatesFocus: true,
    } as const satisfies ShadowRootInit,

    using_emoji_flag: true,
    post_actions_enabled: true,
    sandboxedPluginRuntime: false,

    // sentry
    sentry_earliest_version: env.VERSION || env.VERSION,
    sentry_sample_rate: 0.05,
    sentry_enabled: prodOnly,
    sentry_event_enabled: prodOnly,
    sentry_exception_enabled: prodOnly,
    sentry_fetch_transaction_enabled: prodOnly,
    sentry_async_transaction_enabled: devOnly,

    // mixpanel
    mixpanel_earliest_version: env.VERSION || env.VERSION,
    mixpanel_sample_rate: 1,
    mixpanel_enabled: prodOnly,
    mixpanel_event_enabled: prodOnly,
    mixpanel_exception_enabled: prodOnly,
    mixpanel_project_token: 'b815b822fd131650e92ff8539eb5e793',

    // wallet connect
    wc_v1_bridge_url: 'https://bridge.walletconnect.org',
    wc_v2_relay_url: 'wss://relay.walletconnect.com',
    wc_v2_project_id: '8f1769933420afe8873860925fcca14f',
    wc_v2_mode: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    wc_v1_enabled: true,
    wc_v2_enabled: false,
} as const

Object.freeze(flags.shadowRootInit)
if (process.env.NODE_ENV === 'development') {
    console.log('Mask Network starts with flags:', flags)
}
