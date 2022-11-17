import { startReactDevTools } from './react.js'
import { attachListener } from './utils.js'

function init() {
    const controller = new AbortController()
    startReactDevTools(controller.signal)

    function onRefresh() {
        // let's be the last task to run in the event loop. but is it ordered?
        controller.signal.addEventListener('abort', init, { once: true })
        controller.abort()
    }
    attachListener(browser.devtools.network.onNavigated, onRefresh, { signal: controller.signal })
}
init()
