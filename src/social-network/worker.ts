import { getUrl } from '../utils/utils'

export interface WorkerEnv {
    platform: 'desktop' | 'mobile'
    implementation: 'WebExtension' | 'chrome-extension' | 'holoflows-extension' | 'unknown'
}

export interface SocialNetworkWorker {
    injectedScript?: {
        code: string
        url: browser.events.UrlFilter[]
    }
}

export const definedSocialNetworks = new Map<string, SocialNetworkWorker>()
export function defineSocialNetworkWorker(networkIdentifier: string, config: (env: WorkerEnv) => SocialNetworkWorker) {
    definedSocialNetworks.set(networkIdentifier, config(env))
}
const url = getUrl('/')
const env: WorkerEnv = {
    implementation: url.startsWith('chrome-extension://')
        ? 'chrome-extension'
        : url.startsWith('holoflows-extension://')
        ? 'holoflows-extension'
        : url.indexOf('-extension://') !== -1
        ? 'WebExtension'
        : 'unknown',
    platform: navigator.userAgent.match(/Mobile|mobile/) ? 'mobile' : 'desktop',
}
