import { definedSocialNetworkUIs, loadSocialNetworkUI } from '../../social-network'
import { independentRef } from '../../components/DataSource/useMyPersonas'
import { Flags } from '../../utils/flags'
import { requestSNSAdaptorPermission } from '../../social-network/utils/permissions'

import { delay } from '../../utils/utils'

export const getDefinedSocialNetworkUIs = async () => {
    return definedSocialNetworkUIs
}

export const getMyPersonas = async () => {
    return independentRef.myPersonasRef
}

interface SocialNetworkProvider {
    internalName: string
    network: string
}

export const connectSocialNetwork = async (provider: SocialNetworkProvider) => {
    const ui = await loadSocialNetworkUI(provider.internalName)
    const home = ui.utils.getHomePage?.()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }

    await delay(100)
    home && browser.tabs.create({ active: true, url: home })
}
