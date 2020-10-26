const is_iOSApp = process.env.target === 'safari' && process.env.architecture === 'app'
const isAndroidApp = process.env.architecture === 'app' && process.env.target === 'firefox'

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
    has_no_browser_tab_ui: process.env.architecture === 'app',

    inject_dashboard_entrance: process.env.architecture === 'app',
    /**
     * - In iOS, the ShadowDOM mode is not really safe.
     * - In test(Jest) mode, there is no ShadowDOM support.
     * - In storybook, there is no need to use ShadowDOM.
     */
    no_ShadowDOM_support: is_iOSApp || process.env.NODE_ENV === 'test' || process.env.STORYBOOK,
    /** In E2E, prefer open shadow root so we can test it. */
    using_ShadowDOM_attach_mode: process.env.target === 'E2E' ? 'open' : 'closed',
    /** Don't inject injected script in this mode. Native side will do the job. */
    support_native_injected_script_declaration: is_iOSApp,
    /** Don't show welcome page in this mode. Native side will do the job. */
    has_native_welcome_ui: process.env.architecture === 'app',
    /** Firefox has a special API that can inject to the document with a higher permission. */
    requires_injected_script_run_directly: process.env.target === 'firefox',
    // TODO: document why it enabled on app
    support_eth_network_switch: process.env.architecture === 'app' || betaOrInsiderOnly,
    //#region Experimental features
    transak_enabled: webOnly,
    trader_enabled: webOnly,
    trader_all_api_cached_enabled: devOnly,
    poll_enabled: webOnly,
    // Note: the server has closed
    matrix_based_service_enabled: false,
    wallet_connect_support_enabled: webOnly,
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
