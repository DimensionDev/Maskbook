import { combineAbortSignal } from '@masknet/kit'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide/index.js'

export function createTaskStartSetupGuideDefault() {
    return (signal: AbortSignal, persona: PersonaIdentifier) => {
        const controller = new AbortController()
        const combinedSignal = combineAbortSignal(controller.signal, signal)
        attachReactTreeWithoutContainer(
            'setup-guide',
            <SetupGuide persona={persona} onClose={() => controller.abort()} />,
            combinedSignal,
        )
    }
}
