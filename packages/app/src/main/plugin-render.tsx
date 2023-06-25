import '../plugin-host/enable.js'

import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom'
import { MaskLightTheme } from '@masknet/theme'
import type { TypedMessage } from '@masknet/typed-message'

function useTheme() {
    return MaskLightTheme
}

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
)

export default function PluginRender(props: { message: TypedMessage }) {
    // return PageUIProvider(useTheme, <Decrypted message={props.message} />)
    return <Decrypted message={props.message} />
}
