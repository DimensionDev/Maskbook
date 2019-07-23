export interface SocialNetworkWorker {
    injectedScript?: {
        code: string
        url: browser.events.UrlFilter[]
    }
}

export const definedSocialNetworks = new Map<string, SocialNetworkWorker>()
export function defineSocialNetworkWorker(networkIdentifier: string, config: SocialNetworkWorker) {}
