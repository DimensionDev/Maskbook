import '../plugin-host/enable.js'

import { PageUIProvider } from '@masknet/shared'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { ShadowRootIsolation, MaskLightTheme } from '@masknet/theme'

function useTheme() {
    return MaskLightTheme
}

const GlobalInjection = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.GlobalInjection,
)

export interface PageInspectorProps {}

export default function PageInspectorRender(props: PageInspectorProps) {
    return <ShadowRootIsolation>{PageUIProvider(useTheme, <GlobalInjection />)}</ShadowRootIsolation>
}
