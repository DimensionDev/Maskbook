import type { WebviewAPIs } from './types'
import Services from '../../extension/service'
import { definedSocialNetworkWorkers } from '../../social-network/worker'

export const WebviewAPI: WebviewAPIs = {
    web_echo: async (arg) => arg,
    getUrl: (path: string) => browser.runtime.getURL(path),
    getStorage: async (key: string) => browser.storage.local.get(key),
    getConnectedPersona: async () => {
        const personas = await Services.Identity.queryMyPersonas()
        return personas
            .filter((p) => !p.uninitialized)
            .map((p) => {
                const profiles = [...p.linkedProfiles]
                const providers = [...definedSocialNetworkWorkers].map((i) => {
                    const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
                    return {
                        internalName: i.internalName,
                        network: i.networkIdentifier,
                        connected: !!profile,
                        userId: profile?.[0].userId,
                        identifier: profile?.[0],
                    }
                })
                return { providers, ...p }
            })
    },
}
