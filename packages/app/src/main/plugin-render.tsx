import '../plugin-host/enable.js'

import type { TypedMessage } from '@masknet/typed-message'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
)

export default function PluginRender(props: { message: TypedMessage }) {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <Decrypted message={props.message} />
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    )
}
