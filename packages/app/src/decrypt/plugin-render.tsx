import '../plugin-host/enable.js'

import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TypedMessage } from '@masknet/typed-message'
import { NetworkContextProvider } from '@masknet/web3-hooks-base'

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
)

export default function PluginRender(props: { message: TypedMessage }) {
    return (
        <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <Decrypted message={props.message} />
        </NetworkContextProvider>
    )
}
