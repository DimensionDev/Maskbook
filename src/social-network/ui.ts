import { env, SocialNetworkWorkerAndUI } from './shared'

export interface SocialNetworkUI extends SocialNetworkWorkerAndUI {
    /**
     * Should this UI content script activate?
     */
    shouldActivate(): boolean
}

export const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
export function defineSocialNetworkUI<T extends SocialNetworkUI>(UI: T) {
    definedSocialNetworkUIs.add(UI)
}
