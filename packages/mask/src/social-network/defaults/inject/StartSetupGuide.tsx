import type { PersonaIdentifier } from '../../../database/type'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide'
import { Flags } from '../../../../shared'

function UI({ unmount, persona }: { unmount: () => void; persona: PersonaIdentifier }) {
    return <SetupGuide persona={persona} onClose={unmount} />
}

export function createTaskStartSetupGuideDefault() {
    let shadowRoot: ShadowRoot
    return (signal: AbortSignal, for_: PersonaIdentifier) => {
        const dom = document.createElement('span')
        document.body.appendChild(dom)
        const root = createReactRootShadowed(
            shadowRoot || (shadowRoot = dom.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })),
            { signal },
        )
        root.render(<UI persona={for_} unmount={() => root.destory()} />)
    }
}
