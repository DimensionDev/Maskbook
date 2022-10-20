import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { Wall } from 'react-devtools-inline/frontend.js'

export const GLOBAL_ID_KEY = '__REACT__DEVTOOLS__INSTANCE__ID__'
export interface DevtoolsMessage {
    [key: `_${string}`]: any
    // The discovery has the following possibilities:
    // 1. The content script is loaded before the devtools panel is opened.
    //    In this case, the handshake will be: activateBackend => _
    // 2. The devtools is loaded, and the page refreshes.
    //    In this case, the handshake will be: helloFromBackend => activateBackend => _
    activateBackend: string
    helloFromBackend: void
    //
    farewell: void
}
export const DevtoolsMessage = new WebExtensionMessage<DevtoolsMessage>({
    domain: 'devtools',
})

export function createReactDevToolsWall(id: string): Wall {
    const channel = `_${id}` as const
    return {
        listen: DevtoolsMessage.events[channel].on,
        send(event, payload, transferable) {
            if (transferable) throw new TypeError('transferable is not supported')
            DevtoolsMessage.events[channel].sendByBroadcast({ event, payload })
        },
    }
}
