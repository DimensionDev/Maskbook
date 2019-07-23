import { getUrl } from '../utils/utils'
export interface SocialNetworkWorkerAndUI {
    name: string
    /**
     * @param env The env that Maskbook running in
     * @param preference Users settings about Maskbook
     */
    init(env: Env, preference: Preference): void
}
/**
 * Users settings about Maskbook
 */
export interface Preference {}

/**
 * The env that Maskbook running in
 */
export interface Env {
    platform: 'desktop' | 'mobile'
    implementation: 'WebExtension' | 'chrome-extension' | 'holoflows-extension' | 'unknown'
}
const url = getUrl('/')
export const env: Env = {
    implementation: url.startsWith('chrome-extension://')
        ? 'chrome-extension'
        : url.startsWith('holoflows-extension://')
        ? 'holoflows-extension'
        : url.indexOf('-extension://') !== -1
        ? 'WebExtension'
        : 'unknown',
    platform: navigator.userAgent.match(/Mobile|mobile/) ? 'mobile' : 'desktop',
}
