import { definedSocialNetworkUIs, loadSocialNetworkUI } from '../../social-network'
import { Flags } from '../../utils/flags'
import { requestSNSAdaptorPermission } from '../../social-network/utils/permissions'

import { delay } from '../../utils/utils'
import { currentSetupGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../../components/InjectedComponents/SetupGuide'
import { independentRef } from '../../components/DataSource/useMyPersonas'

export const getDefinedSocialNetworkUIs = async () => {
    const definedSocialNetworkUIsValue = definedSocialNetworkUIs.values()

    return [...definedSocialNetworkUIsValue].map(({ networkIdentifier }) => {
        return {
            networkIdentifier,
        }
    })
}

export interface SocialNetworkProvider {
    internalName: string
    network: string
}

export const connectSocialNetwork = async (identifier: string, provider: SocialNetworkProvider) => {
    const ui = await loadSocialNetworkUI(provider.internalName)
    const home = ui.utils.getHomePage?.()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    currentSetupGuideStatus[provider.network].value = stringify({
        status: SetupGuideStep.FindUsername,
        persona: identifier,
    })
    await delay(100)
    home && browser.tabs.create({ active: true, url: home })
}

export const getMyPersonas = async () => {
    return independentRef.myPersonasRef.value
}
