import { env } from '@masknet/flags'
import type { SiteAdaptorUI } from '@masknet/types'

const definedSiteAdaptorsUILocal = new Map<string, SiteAdaptorUI.DeferredDefinition>()
export const definedSiteAdaptorsUI: ReadonlyMap<string, SiteAdaptorUI.DeferredDefinition> = definedSiteAdaptorsUILocal

export async function activateSiteAdaptorUI(): Promise<void> {
    const ui_deferred = [...definedSiteAdaptorsUI.values()].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return
    const { activateSiteAdaptorUIInner } = await import('./ui.js')
    try {
        await activateSiteAdaptorUIInner(ui_deferred)
    } catch (error) {
        console.error('Mask: Failed to initialize Social Network Adaptor', error)
    }
}
export function defineSiteAdaptorUI(UI: SiteAdaptorUI.DeferredDefinition) {
    if (UI.notReadyForProduction) {
        if (env.channel === 'stable' && process.env.NODE_ENV === 'production') return UI
    }
    definedSiteAdaptorsUILocal.set(UI.networkIdentifier, UI)
    return UI
}
