import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export interface DevtoolsMessage {
    _: any
    // The discovery has the following possibilities:
    // 1. The content script is loaded before the devtools panel is opened.
    //    In this case, the handshake will be: activateBackend => _
    // 2. The devtools is loaded, and the page refreshes.
    //    In this case, the handshake will be: helloFromBackend => activateBackend => _
    activateBackend: void
    helloFromBackend: void
    //
    farewell: void
}
export const DevtoolsMessage = new WebExtensionMessage<DevtoolsMessage>({
    domain: 'devtools',
})
