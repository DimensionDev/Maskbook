import type { PersonaIdentifier } from '@masknet/shared-base'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide'
import { Flags } from '../../../../shared'

function UI({ unmount, persona }: { unmount: () => void; persona: PersonaIdentifier }) {
    return <SetupGuide persona={persona} onClose={unmount} />
}

export function createTaskStartSetupGuideDefault() {
    let shadowRoot: ShadowRoot
    return (signal: AbortSignal, for_: PersonaIdentifier) => {
        shadowRoot ??= document.body
            .appendChild(document.createElement('div'))
            .attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })

        const root = createReactRootShadowed(shadowRoot, { signal, key: 'setup-guide' })
        root.render(<UI persona={for_} unmount={() => root.destory()} />)
    }
}
