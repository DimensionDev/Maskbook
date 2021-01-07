export const is_iOSApp = process.env.target === 'safari' && process.env.architecture === 'app'
export const isAndroidApp = process.env.architecture === 'app' && process.env.target === 'firefox'
const appOnly = process.env.architecture === 'app'

const devOnly = process.env.NODE_ENV === 'development'

const webOnly = process.env.architecture === 'web' || devOnly

const insiderOnly = process.env.build === 'insider' || devOnly
const betaOrInsiderOnly = insiderOnly || process.env.build === 'beta'
// TODO: In future, we can turn this object into a Proxy to receive flags from remote
export const Flags = {
    __raw__: {
        target: process.env.target,
        architecture: process.env.architecture,
    },
    /** There is no "tabs" to navigate to. We must be careful with this. */
    has_no_browser_tab_ui: appOnly,
    has_no_connected_user_link: appOnly,
    has_native_nav_bar: appOnly,
    inject_search_prediction_box: webOnly,
    /** In E2E, prefer open shadow root so we can test it. */
    using_ShadowDOM_attach_mode: process.env.target === 'E2E' ? 'open' : 'closed',
    /** Don't inject injected script in this mode. Native side will do the job. */
    support_native_injected_script_declaration: is_iOSApp,
    /** Don't show welcome page in this mode. Native side will do the job. */
    has_native_welcome_ui: appOnly,
    /** Firefox has a special API that can inject to the document with a higher permission. */
    requires_injected_script_run_directly: process.env.target === 'firefox',
    // TODO: document why it enabled on app
    support_eth_network_switch: appOnly || betaOrInsiderOnly,
    //#region Experimental features
    image_payload_marked_as_beta: appOnly,
    /** Prohibit the use of test networks in production */
    wallet_network_strict_mode_enabled: process.env.NODE_ENV === 'production' && !betaOrInsiderOnly,
    transak_enabled: webOnly,
    trader_enabled: webOnly,
    trader_zrx_enabled: webOnly,
    trader_all_api_cached_enabled: devOnly,
    poll_enabled: webOnly,
    election2020_enabled: webOnly,
    ITO_enabled: webOnly,
    election2020_composition_dialog_enabled: betaOrInsiderOnly || devOnly,
    COTM_enabled: webOnly,
    COTM_composition_dialog_enabled: betaOrInsiderOnly || devOnly,
    // Note: the server has closed
    matrix_based_service_enabled: false,
    metamask_support_enabled: webOnly,
    //#endregion

    //#region Functionality missing / broken
    /**
     * - iOS: WebExtension polyfill didn't implemented the dynamic permission API
     * - E2E: Cannot click the "allow" button (maybe a Puppeteer bug) in the Puppeteer (maybe a bug)
     */
    no_web_extension_dynamic_permission_request: is_iOSApp || process.env.target === 'E2E',
    has_no_WebRTC: process.env.target === 'safari' || !globalThis?.navigator?.permissions?.query,
    //#endregion
} as const

if (process.env.NODE_ENV === 'development') {
    console.log('Run with flags:', Flags)
}
