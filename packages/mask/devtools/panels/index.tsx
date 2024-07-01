/// <reference path="../../../polyfills/types/dom.d.ts" />
import { attachListener } from './utils.js'

Object.assign(globalThis, {
    __IS_CHROME__: true,
    __IS_FIREFOX__: false,
    __IS_EDGE__: false,
})
function init() {
    const controller = new AbortController()

    // See https://github.com/facebook/react/pull/26193
    const FRAME_TIME = 16
    let lastTime = 0
    globalThis.requestAnimationFrame = function (callback: FrameRequestCallback) {
        const now = window.performance.now()
        const nextTime = Math.max(lastTime + FRAME_TIME, now)
        return setTimeout(function () {
            callback((lastTime = nextTime))
        }, nextTime - now)
    }
    window.cancelAnimationFrame = clearTimeout

    import('@masknet/flags/build-info')
        .then((mod) => mod.setupBuildInfo())
        .then(() => import(/* webpackMode: 'eager' */ './react.js'))
        .then((m) => m.startReactDevTools(controller.signal))

    function onRefresh() {
        // let's be the last task to run in the event loop. but is it ordered?
        controller.signal.addEventListener('abort', init, { once: true })
        controller.abort()
    }
    attachListener(browser.devtools.network.onNavigated, onRefresh, { signal: controller.signal })
}
init()
