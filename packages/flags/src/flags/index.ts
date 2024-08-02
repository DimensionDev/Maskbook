import { env } from './buildInfo.js'
import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import type { FlagSpec } from './flag-spec.js'

const isTest = process.env.NODE_ENV === 'test'
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'
const isInsider = env.channel === 'insider' || isDev
const isBeta = isInsider || env.channel === 'beta'

export const flags: FlagSpec = {
    mask_sdk_enabled: isBeta,
    support_testnet_switch: isBeta,

    shadowRootInit: {
        mode:
            (
                '__REACT_DEVTOOLS_GLOBAL_HOOK__' in globalThis ||
                isBeta ||
                isTest ||
                !isEnvironment(Environment.HasBrowserAPI)
            ) ?
                'open'
            :   'closed',
        delegatesFocus: true,
    } as const satisfies ShadowRootInit,

    using_emoji_flag: true,
    post_actions_enabled: true,
    sandboxedPluginRuntime: false,

    // twitter
    twitter_token:
        'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',

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
    wc_relay_url: 'wss://relay.walletconnect.com',
    wc_project_id: '8f1769933420afe8873860925fcca14f',
    wc_mode: isProd ? 'error' : 'debug',
    wc_enabled: process.env.NODE_ENV !== 'test',

    globalDisabledPlugins: [],
}

Object.freeze(flags.shadowRootInit)
