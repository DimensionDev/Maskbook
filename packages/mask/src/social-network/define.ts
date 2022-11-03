import type { SocialNetworkUI } from '@masknet/social-network-infra'

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
export function defineSocialNetworkUI(UI: SocialNetworkUI.DeferredDefinition) {
    if (UI.notReadyForProduction) {
        if (process.env.channel === 'stable' && process.env.NODE_ENV === 'production') return UI
    }
    definedSocialNetworkUIsLocal.set(UI.networkIdentifier, UI)
    return UI
}
