import { initialize, createBridge, DevtoolsProps, Wall, createStore } from 'react-devtools-inline/frontend'
import type { ComponentType } from 'react'
import { DevtoolsMessage } from '../shared.js'

export function createReactDevTools() {
    const wall: Wall = {
        listen: DevtoolsMessage.events._.on,
        send(event, payload, transferable) {
            if (transferable) throw new TypeError('transferable is not supported')
            DevtoolsMessage.events._.sendByBroadcast({ event, payload })
        },
    }
    const bridge = createBridge(null!, wall)
    const store = createStore(bridge, {
        // @ts-expect-error
        isProfiling: false,
        supportsReloadAndProfile: false,
        supportsProfiling: false,
        supportsTimeline: false,
        supportsTraceUpdates: true,
    })

    // Note: since we manually passed bridge and wall, the first argument is unused in the implementation
    // Note: DT type is wrong
    // @ts-expect-error
    const ReactDevTools: ComponentType<Partial<DevtoolsProps>> = initialize(null!, { bridge, store })
    return { ReactDevTools, store, bridge }
}
