import { definedSocialNetworkUIs, loadSocialNetworkUI } from '../../social-network'
import { Flags } from '../../utils/flags'
import { requestSNSAdaptorPermission } from '../../social-network/utils/permissions'

import { delay } from '../../utils/utils'
import { currentSetupGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../../components/InjectedComponents/SetupGuide'
import type { PersonaIdentifier } from '@masknet/shared'

export async function getDefinedSocialNetworkUIs() {
    return [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
        return {
            networkIdentifier,
        }
    })
}
export async function connectSocialNetwork(identifier: PersonaIdentifier, network: string) {
    const ui = await loadSocialNetworkUI(network)
    const home = ui.utils.getHomePage?.()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        // TODO: requesting permission need a popup in Firefox.
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    currentSetupGuideStatus[network].value = stringify({
        status: SetupGuideStep.FindUsername,
        persona: identifier.toText(),
    })
    await delay(100)
    home && browser.tabs.create({ active: true, url: home })
}
