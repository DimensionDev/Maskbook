/**
 * Currently we don't have so much code that need conditional compilation.
 *
 * So let's set webpackEnv.target in runtime and reduce the compile time.
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
if (globalThis.webpackEnv.target === 'Firefox') {
    // firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
    const isMobile = navigator.userAgent.match(/Mobile|mobile/)
    if (!globalThis.process.env.firefoxVariant) {
        // TODO: How can we know if it is GeckoView in runtime?
        globalThis.process.env.firefoxVariant = isMobile ? 'desktop' : 'android'
    }
}
