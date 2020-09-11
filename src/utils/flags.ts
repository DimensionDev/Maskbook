const is_iOSApp = process.env.target === 'safari' && process.env.architecture === 'app'
const isAndroidApp = process.env.architecture === 'app' && process.env.target === 'firefox'

// TODO: In future, we can turn this object into a Proxy to receive flags from remote
export const Flags = {
    /** There is no "tabs" to navigate to. We must be careful with this. */
    has_no_browser_tab_ui: process.env.architecture === 'app',
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
    support_eth_network_switch: process.env.NODE_ENV === 'development' || process.env.architecture === 'app',
    //#region Experimental features
    trader_enabled: process.env.architecture === 'web' || process.env.NODE_ENV === 'development',
    file_service_enabled: process.env.architecture === 'web' || process.env.NODE_ENV === 'development',
    matrix_based_service_enabled: process.env.NODE_ENV === 'development',
    //#endregion

    //#region Functionality missing / broken
    must_not_start_web_worker: process.env.NODE_ENV === 'test' || process.env.STORYBOOK,
    /**
     * - iOS: WebExtension polyfill didn't implemented the dynamic permission API
     * - E2E: Cannot click the "allow" button (maybe a Puppeteer bug) in the Puppeteer (maybe a bug)
     */
    no_web_extension_dynamic_permission_request: is_iOSApp || process.env.target === 'E2E',
    /** Don't know how to "upload" the picture yet. */
    no_post_image_payload_support: process.env.resolution === 'mobile',
    /**
     * @see https://bugs.webkit.org/show_bug.cgi?id=177350
     *
     * TODO: We're no longer storing a CryptoKey in the database. Maybe we can remove this flag now.
     */
    has_Safari_IndexedDB_bug: process.env.target === 'safari',
    //#endregion
} as const
