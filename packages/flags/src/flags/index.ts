import { env } from './buildInfo.js'
import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'

const isTest = process.env.NODE_ENV === 'test'
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'
const isInsider = env.channel === 'insider' || isDev
const isBeta = isInsider || env.channel === 'beta'

export const flags = {
    maskSDKEnabled: isBeta,
    support_testnet_switch: isBeta,

    shadowRootInit: {
        mode:
            '__REACT_DEVTOOLS_GLOBAL_HOOK__' in globalThis ||
            isBeta ||
            isTest ||
            !isEnvironment(Environment.HasBrowserAPI)
                ? 'open'
                : 'closed',
        delegatesFocus: true,
    } as const satisfies ShadowRootInit,

    using_emoji_flag: true,
    post_actions_enabled: true,
    sandboxedPluginRuntime: false,

    // sentry
    sentry_earliest_version: env.VERSION,
    sentry_sample_rate: 0.05,
    sentry_enabled: isProd,
    sentry_event_enabled: isProd,
    sentry_exception_enabled: isProd,
    sentry_fetch_transaction_enabled: isProd,
    sentry_async_transaction_enabled: isDev,

    // mixpanel
    mixpanel_earliest_version: env.VERSION,
    mixpanel_sample_rate: 1,
    mixpanel_enabled: isProd,
    mixpanel_event_enabled: isProd,
    mixpanel_exception_enabled: isProd,
    mixpanel_project_token: 'b815b822fd131650e92ff8539eb5e793',

    // wallet connect
    wc_v1_bridge_url: 'https://bridge.walletconnect.org',
    wc_v2_relay_url: 'wss://relay.walletconnect.com',
    wc_v2_project_id: '8f1769933420afe8873860925fcca14f',
    wc_v2_mode: isProd ? 'error' : 'debug',
    wc_v1_enabled: true,
    wc_v2_enabled: false,
} as const

Object.freeze(flags.shadowRootInit)
if (process.env.NODE_ENV === 'development') {
    console.debug('[mask] flags:', flags)
}
