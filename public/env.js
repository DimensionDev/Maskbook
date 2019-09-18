/**
 * Currently we don't have so much code that need conditional compilation.
 *
 * So let's set process.env.target in runtime and reduce the compile time.
 */
if (!globalThis.process) {
    globalThis.process = {}
}
if (!globalThis.process.env) {
    globalThis.process.env = {}
}
if (!globalThis.process.env.target) {
    const isFirefox = navigator.userAgent.match('Firefox')
    const isChrome = navigator.appVersion.match(/(Chromium|Chrome)/)
    const isiOS = navigator.appVersion.toLowerCase().match('ios')
    // 'Chromium' | 'Firefox' | 'WKWebview' | undefined
    globalThis.process.env.target = isFirefox ? 'Firefox' : isChrome ? 'Chromium' : isiOS ? 'WKWebview' : undefined
}
if (globalThis.process.env.target === 'Firefox') {
    // firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
    const isMobile = navigator.userAgent.match(/Mobile|mobile/)
    if (!globalThis.process.env.firefoxVariant) {
        // TODO: How can we know if it is GeckoView in runtime?
        globalThis.process.env.firefoxVariant = isMobile ? 'desktop' : 'android'
    }
}
