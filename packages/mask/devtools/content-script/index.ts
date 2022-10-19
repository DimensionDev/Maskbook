import { initialize, activate, createBridge, Bridge, Wall } from 'react-devtools-inline/backend'
import { DevtoolsMessage } from '../shared.js'
// @ts-expect-error
import { injectIntoGlobalHook } from 'react-refresh/runtime'

initialize(window)
injectIntoGlobalHook(window)

const wall: Wall = {
    listen: DevtoolsMessage.events._.on,
    send(event, payload, transferable) {
        if (transferable) throw new TypeError('transferable is not supported')
        DevtoolsMessage.events._.sendByBroadcast({ event, payload })
    },
}

let bridge: Bridge<any, any> | undefined = undefined
DevtoolsMessage.events.activateBackend.on(() => {
    if (bridge) return
    bridge = createBridge(window, wall)
    activate(window, { bridge })
})
DevtoolsMessage.events.helloFromBackend.sendByBroadcast()
DevtoolsMessage.events.farewell.on(() => {
    if (!bridge) return
    bridge.shutdown()
    bridge = undefined
})
