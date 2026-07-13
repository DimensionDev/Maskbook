import type { PersonaIdentifier } from '@masknet/shared-base'
import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { SetupGuide } from '../../../components/InjectedComponents/SetupGuide/index.js'

function startSetupGuide(signal: AbortSignal, persona: PersonaIdentifier) {
    attachReactTreeWithoutContainer('setup-guide', <SetupGuide persona={persona} />, signal)
}

export function createTaskStartSetupGuideDefault() {
    return startSetupGuide
}
