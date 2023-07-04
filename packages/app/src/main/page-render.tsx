import '../plugin-host/enable.js'

import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export interface PageInspectorProps {}

export default function PageInspectorRender(props: PageInspectorProps) {
    return (
        <DisableShadowRootContext.Provider value={false}>
            <ShadowRootIsolation>
                <GlobalInjection />
            </ShadowRootIsolation>
        </DisableShadowRootContext.Provider>
    )
}
