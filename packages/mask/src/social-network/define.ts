import { env } from '@masknet/flags'
import type { SiteAdaptorUI } from '@masknet/types'

const definedSiteAdaptorsUILocal = new Map<string, SiteAdaptorUI.DeferredDefinition>()
export const definedSiteAdaptorsUI: ReadonlyMap<string, SiteAdaptorUI.DeferredDefinition> = definedSiteAdaptorsUILocal

export function activateSiteAdaptorUI() {
    const ui_deferred = [...definedSiteAdaptorsUI.values()].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return Promise.resolve(false)
    return import('./ui.js')
        .then((x) => x.activateSiteAdaptorUIInner(ui_deferred))
        .then(
            () => true,
            (error) => {
                console.error('Mask: Failed to initialize Social Network Adaptor', error)
                return false
            },
        )
}
export function defineSiteAdaptorUI(UI: SiteAdaptorUI.DeferredDefinition) {
    if (UI.notReadyForProduction) {
        if (env.channel === 'stable' && process.env.NODE_ENV === 'production') return UI
    }
    definedSiteAdaptorsUILocal.set(UI.networkIdentifier, UI)
    return UI
}
