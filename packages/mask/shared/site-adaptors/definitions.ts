import type { SiteAdaptor } from './types.js'

const defined = new Map<string, SiteAdaptor.Definition>()
export const definedSiteAdaptors: ReadonlyMap<string, SiteAdaptor.Definition> = defined

export function defineSiteAdaptor(UI: SiteAdaptor.Definition) {
    defined.set(UI.networkIdentifier, UI)
}
