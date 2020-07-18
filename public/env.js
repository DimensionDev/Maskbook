/**
 * We emulate environment variables. Don't expect tree shaking from this.
 */
if (!globalThis.webpackEnv) {
    globalThis.webpackEnv = {}
}
if (!globalThis.webpackEnv.target) {
    const isFirefox = navigator.userAgent.match('Firefox')
    const isChrome = navigator.appVersion.match(/(Chromium|Chrome)/)
    const isiOS = navigator.appVersion.toLowerCase().match('ios')
    // 'Chromium' | 'Firefox' | 'WKWebview' | undefined
    globalThis.webpackEnv.target = isFirefox ? 'Firefox' : isChrome ? 'Chromium' : isiOS ? 'WKWebview' : undefined
}
if (!globalThis.webpackEnv.shadowRootMode) {
    globalThis.webpackEnv.shadowRootMode = 'closed'
}
if (globalThis.webpackEnv.target === 'Firefox') {
    // firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
    const isMobile = navigator.userAgent.match(/Mobile|mobile/)
    if (!globalThis.webpackEnv.firefoxVariant) {
        // TODO: How can we know if it is GeckoView in runtime?
        globalThis.webpackEnv.firefoxVariant = isMobile ? 'desktop' : 'android'
    }
}
globalThis.process = {
    env: { NODE_ENV: 'development', STORYBOOK: false },
}
