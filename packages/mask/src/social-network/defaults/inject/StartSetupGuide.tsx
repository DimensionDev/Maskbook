import type { PersonaIdentifier } from '@masknet/shared-base'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide.js'

function UI({ unmount, persona }: { unmount: () => void; persona: PersonaIdentifier }) {
    return <SetupGuide persona={persona} onClose={unmount} />
}

export function createTaskStartSetupGuideDefault() {
    let shadowRoot: ShadowRoot
    return (signal: AbortSignal, for_: PersonaIdentifier) => {
        shadowRoot ??= document.body
            .appendChild(document.createElement('div'))
            .attachShadow({ mode: process.env.shadowRootMode })

        const root = createReactRootShadowed(shadowRoot, { signal, key: 'setup-guide' })
        root.render(<UI persona={for_} unmount={() => root.destroy()} />)
    }
}
