export const is_iOSApp = process.env.engine === 'safari' && process.env.architecture === 'app'
export const isAndroidApp = process.env.architecture === 'app' && process.env.engine === 'firefox'

const appOnly = process.env.architecture === 'app'
const devOnly = process.env.NODE_ENV === 'development'
const webOnly = process.env.architecture === 'web' || devOnly
const insiderOnly = process.env.channel === 'insider' || devOnly
const betaOrInsiderOnly = insiderOnly || process.env.channel === 'beta'

// TODO: In future, we can turn this object into a Proxy to receive flags from remote
export const Flags = {
    __raw__: {
        target: process.env.engine,
        architecture: process.env.architecture,
    },
    mask_SDK_ready: betaOrInsiderOnly,
    /** There is no "tabs" to navigate to. We must be careful with this. */
    has_no_browser_tab_ui: appOnly,
    has_no_connected_user_link: appOnly,
    has_native_nav_bar: appOnly,
    using_ShadowDOM_attach_mode: 'closed' as ShadowRootMode,
    /** Don't inject injected script in this mode. Native side will do the job. */
    support_declarative_user_script: is_iOSApp,
    /** Don't show welcome page in this mode. Native side will do the job. */
    has_native_welcome_ui: appOnly,
    /** Firefox has a special API that can inject to the document with a higher permission. */
    has_firefox_xray_vision: process.env.engine === 'firefox',
    support_testnet_switch: betaOrInsiderOnly,
    //#region Experimental features
    image_payload_marked_as_beta: appOnly,
    transak_enabled: webOnly,
    trader_zrx_enabled: webOnly,
    trader_all_api_cached_enabled: devOnly,
    metamask_enabled: webOnly,
    injected_web3_enabled: webOnly,
    toolbox_enabled: webOnly,
    /** Prohibit the use of test networks in production */
    wallet_allow_testnet: betaOrInsiderOnly || process.env.NODE_ENV !== 'production',
    wallet_mnemonic_words_backup_enabled: false,
    wallet_private_key_backup_enabled: true,
    wallet_gas_price_dialog_enable: true,
    /* construct LBP for all ERC20 tokens */
    LBP_enabled: false,
    LBP_whitelist_enabled: process.env.NODE_ENV === 'production',
    plugin_switch_enabled: betaOrInsiderOnly,
    //#endregion

    EIP1559_enabled: true,

    bsc_enabled: true,
    polygon_enabled: true,
    fantom_enabled: true,
    arbitrum_enabled: true,
    xdai_enabled: true,
    flow_enabled: true,
    celo_enabled: true,
    nft_airdrop_enabled: false,

    //#region Functionality missing / broken
    /**
     * - iOS: WebExtension polyfill didn't implemented the dynamic permission API
     */
    no_web_extension_dynamic_permission_request: is_iOSApp,
    has_no_WebRTC: process.env.engine === 'safari' || !globalThis?.navigator?.permissions?.query,
    //#endregion
    using_emoji_flag: true,
} as const

if (process.env.NODE_ENV === 'development') {
    console.log('Mask network starts with flags:', Flags)
}
