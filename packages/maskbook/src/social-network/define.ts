import type { SocialNetworkUI } from '.'
import type { SocialNetworkWorker } from '.'

const definedSocialNetworkUIsLocal = new Map<string, SocialNetworkUI.DeferredDefinition>()
export const definedSocialNetworkUIs: ReadonlyMap<string, SocialNetworkUI.DeferredDefinition> =
    definedSocialNetworkUIsLocal

export function activateSocialNetworkUI() {
    const ui_deferred = [...definedSocialNetworkUIs.values()].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return Promise.resolve(false)
    return import('./ui').then((x) => x.activateSocialNetworkUIInner(ui_deferred)).then(() => true)
}
export function defineSocialNetworkUI(UI: SocialNetworkUI.DeferredDefinition) {
    if (UI.notReadyForProduction) {
        if (process.env.build === 'stable' && process.env.NODE_ENV === 'production') return UI
    }
    definedSocialNetworkUIsLocal.set(UI.networkIdentifier, UI)
    return UI
}

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker.DeferredDefinition>()
export function defineSocialNetworkWorker(worker: SocialNetworkWorker.DeferredDefinition) {
    if (worker.notReadyForProduction) {
        if (process.env.build === 'stable' && process.env.NODE_ENV === 'production') return
    }
    definedSocialNetworkWorkers.add(worker)
}
