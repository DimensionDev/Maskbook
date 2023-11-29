import '../initialization/plugin-host/enable.js'

import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export default function PageInspectorRender() {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <GlobalInjection />
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    )
}
