/**
 * Currently we don't have so much code that need conditional compilation.
 *
 * So let's set process.env.target in runtime and reduce the compile time.
 */

if (!globalThis.webpackEnv) {
    globalThis.webpackEnv = {}
}
if (!globalThis.webpackEnv.target) {
    globalThis.webpackEnv.target = _WEBPACK_BUILD_TARGET
}
if (globalThis.webpackEnv.target === 'Firefox') {
    globalThis.webpackEnv.firefoxVariant = _WEBPACK_FIREFOX_VARIANT
}
