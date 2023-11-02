import { FacebookAdaptor } from './implementations/facebook.com.js'
import { InstagramAdaptor } from './implementations/instagram.com.js'
import { MindsAdaptor } from './implementations/minds.com.js'
import { MirrorAdaptor } from './implementations/mirror.xyz.js'
import { TwitterAdaptor } from './implementations/twitter.com.js'
import type { SiteAdaptor } from './types.js'

const defined = new Map<string, SiteAdaptor.Definition>()
export const definedSiteAdaptors: ReadonlyMap<string, SiteAdaptor.Definition> = defined

function defineSiteAdaptor(UI: SiteAdaptor.Definition) {
    defined.set(UI.networkIdentifier, UI)
}
defineSiteAdaptor(FacebookAdaptor)
defineSiteAdaptor(InstagramAdaptor)
defineSiteAdaptor(MindsAdaptor)
defineSiteAdaptor(MirrorAdaptor)
defineSiteAdaptor(TwitterAdaptor)
