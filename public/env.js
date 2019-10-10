/**
 * Sometimes we don't want to build a specific targeted version
 * (which will go through dead code elimination),
 *
 * Then the `webpackEnv.target` and `webpackEnv.firefoxVariant` will
 * not be replaced by webpack and then provided by this file.
 *
 * Therefore we can generate a more general build to speed up debug time.
 *
 * This file should not be handled by webpack!
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
    if (!globalThis.webpackEnv.firefoxVariant) {
        // TODO: How can we know if it is GeckoView in runtime?
        globalThis.webpackEnv.firefoxVariant = isMobile ? 'desktop' : 'android'
    }
}
