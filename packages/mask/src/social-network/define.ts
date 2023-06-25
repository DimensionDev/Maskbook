import { getBuildInfo } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/types'

const definedSocialNetworkUIsLocal = new Map<string, SocialNetworkUI.DeferredDefinition>()
export const definedSocialNetworkUIs: ReadonlyMap<string, SocialNetworkUI.DeferredDefinition> =
    definedSocialNetworkUIsLocal

export function activateSocialNetworkUI() {
    const ui_deferred = [...definedSocialNetworkUIs.values()].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return Promise.resolve(false)
    return import('./ui.js')
        .then((x) => x.activateSocialNetworkUIInner(ui_deferred))
        .then(
            () => true,
            (error) => {
                console.error('Mask: Failed to initialize Social Network Adaptor', error)
                return false
            },
        )
}
const { channel } = await getBuildInfo()
export function defineSocialNetworkUI(UI: SocialNetworkUI.DeferredDefinition) {
    if (UI.notReadyForProduction) {
        if (channel === 'stable' && process.env.NODE_ENV === 'production') return UI
    }
    definedSocialNetworkUIsLocal.set(UI.networkIdentifier, UI)
    return UI
}
