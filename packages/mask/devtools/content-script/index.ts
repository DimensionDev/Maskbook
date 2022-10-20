import { initialize, activate, createBridge, Bridge } from 'react-devtools-inline/backend'
import { DevtoolsMessage, GLOBAL_ID_KEY, createReactDevToolsWall } from '../shared.js'

initialize(window)
if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error
    const { injectIntoGlobalHook } = require('react-refresh/runtime')
    injectIntoGlobalHook(window)
}

let bridge: Bridge<any, any> | undefined = undefined
DevtoolsMessage.events.activateBackend.on((id) => {
    if (bridge) return
    const localID = String(Reflect.get(globalThis, GLOBAL_ID_KEY))
    if (localID !== id) return
    bridge = createBridge(window, createReactDevToolsWall(localID))
    activate(window, { bridge })
})
DevtoolsMessage.events.helloFromBackend.sendByBroadcast()
DevtoolsMessage.events.farewell.on(() => {
    if (!bridge) return
    bridge.shutdown()
    bridge = undefined
})
