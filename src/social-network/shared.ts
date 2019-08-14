import { getUrl } from '../utils/utils'
export interface SocialNetworkWorkerAndUI {
    version: 1
    /**
     * Declare what payload does this network supports.
     *
     * Latest = v39
     *
     * When creating new posts,
     * Maskbook will use the latest declared version in `acceptablePayload`
     */
    acceptablePayload: ('latest' | 'v39' | 'v40')[]
    /**
     * This name is used internally and should be unique
     */
    name: string
    /**
     * If using Maskbook on this network is dangerous, set it to true (not supported yet)
     */
    isDangerousNetwork: false
    /**
     * Detect if an Identifier belongs to this provider.
     *
     * For normal network, string like 'twitter.com' is enough.
     *
     * If it works across networks like mastodon,
     * use 'mastodon@your-instance.org' and set this to a function
     *
     * @example 'twitter.com'
     * (networkIdentifier) => networkIdentifier.startsWith('mastodon')
     */
    networkIdentifier: string | ((networkIdentifier: string, env: Env, preference: Preference) => boolean)
    /**
     * @param env The env that Maskbook running in
     * @param preference Users settings about Maskbook
     */
    init(env: Env, preference: Preference): void
    /**
     * URL of the network
     */
    networkURL: string | ((env: Env, preference: Preference) => string)
    /**
     * Is this username valid in this network
     */
    isValidUsername(username: string): boolean
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

export interface Profile {
    bioContent: string
}
