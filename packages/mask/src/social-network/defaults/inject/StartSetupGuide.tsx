import type { PersonaIdentifier } from '@masknet/shared-base'
import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide.js'
import { combineAbortSignal } from '@masknet/kit'

function UI({ unmount, persona }: { unmount: () => void; persona: PersonaIdentifier }) {
    return <SetupGuide persona={persona} onClose={unmount} />
}

export function createTaskStartSetupGuideDefault() {
    return (signal: AbortSignal, for_: PersonaIdentifier) => {
        const controller = new AbortController()
        const combinedSignal = combineAbortSignal(controller.signal, signal)
        attachReactTreeWithoutContainer(
            'setup-guide',
            <UI persona={for_} unmount={() => controller.abort()} />,
            combinedSignal,
        )
    }
}
