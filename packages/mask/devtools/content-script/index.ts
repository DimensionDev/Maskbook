import { initialize, activate, createBridge } from 'react-devtools-inline/backend'
import { DevtoolsMessage } from '../shared.js'
// @ts-expect-error
import { injectIntoGlobalHook } from 'react-refresh/runtime'

initialize(window)
injectIntoGlobalHook(window)

DevtoolsMessage.events.activateBackend.on(
    () => {
        activate(window, {
            bridge: createBridge(window, {
                listen: DevtoolsMessage.events._.on,
                send(event, payload, transferable) {
                    if (transferable) throw new TypeError('transferable is not supported')
                    DevtoolsMessage.events._.sendByBroadcast({ event, payload })
                },
            }),
        })
    },
    { once: true },
)
DevtoolsMessage.events.helloFromBackend.sendByBroadcast()
