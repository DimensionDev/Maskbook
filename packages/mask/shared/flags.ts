export const is_iOSApp = process.env.engine === 'safari' && process.env.architecture === 'app'
export const isAndroidApp = process.env.architecture === 'app' && process.env.engine === 'firefox'

const appOnly = process.env.architecture === 'app'
const devOnly = process.env.NODE_ENV === 'development'
const webOnly = process.env.architecture === 'web' || devOnly
const insiderOnly = process.env.channel === 'insider' || devOnly
const betaOrInsiderOnly = insiderOnly || process.env.channel === 'beta'

// TODO: In future, we can turn this object into a Proxy to receive flags from remote
export const Flags = {
    isolated_dashboard_bridge_enabled: false,
    mask_SDK_ready: betaOrInsiderOnly,
    /** Don't inject injected script in this mode. Native side will do the job. */
    support_declarative_user_script: is_iOSApp,
    /** Don't show welcome page in this mode. Native side will do the job. */
    has_native_welcome_ui: appOnly,
    /** Firefox has a special API that can inject to the document with a higher permission. */
    has_firefox_xray_vision: process.env.engine === 'firefox',
    support_testnet_switch: betaOrInsiderOnly,
    // #region Experimental features
    image_payload_marked_as_beta: appOnly,
    trader_all_api_cached_enabled: devOnly,
    toolbox_enabled: webOnly,
    /** Prohibit the use of test networks in production */
    wallet_allow_testnet: betaOrInsiderOnly || process.env.NODE_ENV !== 'production',
    // #endregion

    bsc_enabled: true,
    polygon_enabled: true,
    arbitrum_enabled: true,
    xdai_enabled: true,
    avalanche_enabled: true,
    fantom_enabled: true,
    celo_enabled: true,
    aurora_enabled: true,
    harmony_enabled: true,
    nft_airdrop_enabled: false,
    post_actions_enabled: true,
    next_id_tip_enabled: true,

    // #region Functionality missing / broken
    /**
     * - iOS: WebExtension polyfill didn't implemented the dynamic permission API
     */
    no_web_extension_dynamic_permission_request: is_iOSApp,
    has_no_WebRTC: process.env.engine === 'safari' || !globalThis?.navigator?.permissions?.query,
    // #endregion
    using_emoji_flag: true,

    // we still need to handle image encoding
    decryptByTwitterXHRInjection: betaOrInsiderOnly,
    v37PayloadDefaultEnabled: false, // new Date() > new Date('2022-07-01'),
} as const

if (process.env.NODE_ENV === 'development') {
    console.log('Mask network starts with flags:', Flags)
}
