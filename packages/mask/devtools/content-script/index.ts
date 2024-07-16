import { initialize, activate, createBridge, type Bridge } from 'react-devtools-inline/backend.js'
import { DevtoolsMessage, GLOBAL_ID_KEY, createReactDevToolsWall } from '../shared.js'

Object.assign(globalThis, {
    __IS_CHROME__: true,
    __IS_FIREFOX__: false,
    __IS_EDGE__: false,
})
initialize(globalThis as typeof window)
if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error conditionally import
    const { injectIntoGlobalHook } = require('react-refresh/runtime')
    injectIntoGlobalHook(globalThis)
}

let bridge: Bridge<any, any> | undefined = undefined
DevtoolsMessage.activateBackend.on((id) => {
    if (bridge) return
    const localID = String(Reflect.get(globalThis, GLOBAL_ID_KEY))
    if (localID !== id) return
    bridge = createBridge(globalThis as typeof window, createReactDevToolsWall(localID, new AbortController().signal))
    activate(globalThis as typeof window, { bridge })
    bridge.send('extensionBackendInitialized')
})
DevtoolsMessage.helloFromBackend.sendByBroadcast()
DevtoolsMessage.farewell.on(() => {
    if (!bridge) return
    bridge.shutdown()
    bridge = undefined
})
