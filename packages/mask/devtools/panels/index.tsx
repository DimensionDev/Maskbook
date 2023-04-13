import { attachListener } from './utils.js'

function init() {
    const controller = new AbortController()

    // this code runs in a invisible page, therefore it's requestAnimationFrame is not being called.
    // some UI libraries (like react-window) require that to work.
    globalThis.requestAnimationFrame = function (callback) {
        return requestIdleCallback((x) => callback(x.timeRemaining()))
    }
    globalThis.cancelAnimationFrame = cancelIdleCallback

    import(/* webpackMode: 'eager' */ './react.js').then((m) => m.startReactDevTools(controller.signal))

    function onRefresh() {
        // let's be the last task to run in the event loop. but is it ordered?
        controller.signal.addEventListener('abort', init, { once: true })
        controller.abort()
    }
    attachListener(browser.devtools.network.onNavigated, onRefresh, { signal: controller.signal })
}
init()
