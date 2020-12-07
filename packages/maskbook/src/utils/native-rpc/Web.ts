import type { WebviewAPIs } from './types'
import Services from '../../extension/service'
import { definedSocialNetworkWorkers } from '../../social-network/worker'
import * as settings from '../../settings/settings'
import type { NativeAPISettingsName } from '../../settings/types'

export const WebviewAPI: WebviewAPIs = {
    web_echo: async (arg) => arg,
    getDashboardURL: async () => browser.runtime.getURL(''),
    getSettings: async (key: NativeAPISettingsName) => settings[key].value,
    getConnectedPersonas: async () => {
        const personas = await Services.Identity.queryMyPersonas()
        return personas
            .filter((p) => !p.uninitialized)
            .map((p) => {
                const profiles = [...p.linkedProfiles]
                const providers = [...definedSocialNetworkWorkers].map((i) => {
                    const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                    return {
                        network: i.networkIdentifier,
                        connected: !!profile,
                    }
                })
                return providers
            })
    },
}
