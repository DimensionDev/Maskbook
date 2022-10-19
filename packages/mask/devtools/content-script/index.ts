import { initialize, activate, createBridge, Bridge } from 'react-devtools-inline/backend'
import { DevtoolsMessage, ReactDevToolsWall } from '../shared.js'
// @ts-expect-error
import { injectIntoGlobalHook } from 'react-refresh/runtime'

initialize(window)
injectIntoGlobalHook(window)

let bridge: Bridge<any, any> | undefined = undefined
DevtoolsMessage.events.activateBackend.on(() => {
    if (bridge) return
    bridge = createBridge(window, ReactDevToolsWall)
    activate(window, { bridge })
})
DevtoolsMessage.events.helloFromBackend.sendByBroadcast()
DevtoolsMessage.events.farewell.on(() => {
    if (!bridge) return
    bridge.shutdown()
    bridge = undefined
})
