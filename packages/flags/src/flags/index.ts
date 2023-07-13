import { env } from './buildInfo.js'
const devOnly = process.env.NODE_ENV === 'development'
const prodOnly = process.env.NODE_ENV === 'production'
const insiderOnly = env.channel === 'insider' || devOnly
const betaOrInsiderOnly = insiderOnly || env.channel === 'beta'

export const flags = {
    isolated_dashboard_bridge_enabled: false,
    mask_SDK_ready: betaOrInsiderOnly,
    /** Firefox has a special API that can inject to the document with a higher permission. */
    has_firefox_xray_vision: !!globalThis.navigator?.userAgent.includes('Firefox'),
    support_testnet_switch: betaOrInsiderOnly,

    shadowRootInit: {
        mode: '__REACT_DEVTOOLS_GLOBAL_HOOK__' in globalThis || betaOrInsiderOnly ? 'open' : 'closed',
        delegatesFocus: true,
    } as const satisfies ShadowRootInit,

    // #region Experimental features
    trader_all_api_cached_enabled: devOnly,
    /** Prohibit the use of test networks in production */
    wallet_allow_testnet: betaOrInsiderOnly || process.env.NODE_ENV !== 'production',
    // #endregion

    bsc_enabled: true,
    polygon_enabled: true,
    arbitrum_enabled: true,
    xdai_enabled: true,
    optimism_enabled: true,
    avalanche_enabled: true,
    fantom_enabled: true,
    celo_enabled: true,
    aurora_enabled: true,
    astar_enabled: true,
    nft_airdrop_enabled: false,
    post_actions_enabled: true,
    next_id_tip_enabled: true,

    using_emoji_flag: true,

    sandboxedPluginRuntime: false,

    /** The earliest version for the sentry to watch events and exceptions. */
    sentry_earliest_version: env.VERSION || env.VERSION,
    sentry_sample_rate: 0.05,
    sentry_enabled: prodOnly,
    sentry_event_enabled: prodOnly,
    sentry_exception_enabled: prodOnly,
    sentry_fetch_transaction_enabled: prodOnly,
    sentry_async_transaction_enabled: devOnly,

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
