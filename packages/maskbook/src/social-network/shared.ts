
export interface SocialNetworkWorkerAndUIDefinition {
    version: 1
    /**
     * Declare what payload does this network supports.
     *
     * Latest = v38
     *
     * When creating new posts,
     * Mask will use the latest declared version in `acceptablePayload`
     */
    acceptablePayload: ('latest' | 'v38' | 'v39' | 'v40')[]
    /**
     * This name is used internally and should be unique
     */
    internalName: string
    /**
     * If using Mask on this network is dangerous, set it to true (not supported yet)
     */
    isDangerousNetwork: boolean
    /**
     * Used to detect if an Identifier belongs to this provider.
     *
     * For normal network, string like 'twitter.com' is enough.
     *
     *
     * If it works across networks like mastodon,
     * They are not supported for now.
     * To enable support for these, you may merge this type:
     * ((networkIdentifier: string, env: Env, preference: Preference) => boolean)
     * then use 'mastodon@your-instance.org' and set this to a function
     * and resolve all type problems.
     *
     * At that time, we may also done this by recognize and hardcode it.
     *
     * @example 'twitter.com'
     * (networkIdentifier) => networkIdentifier.startsWith('mastodon')
     */
    networkIdentifier: string
    /**
     * Return the homepage url. e.g.: https://www.twitter.com/
     */
    getHomePage(): string
    /**
     * @param env The env that Mask running in
     * @param preference Users settings about Mask
     *
     * This function should init the provider.
     *
     * In the UI, it should do:
     *      - InitFriendsValueRef
     *      - InitGroupsValueRef
     *      - InitMyIdentitiesValueRef
     */
    init(env: Env, preference: Preference): void
    /**
     * Is this username valid in this network
     */
    isValidUsername(username: string): boolean
    /**
     * define how to encode public key.
     */
    publicKeyEncoder?: (text: string) => string
    /**
     * define how to decode public key.
     * the result is candidates
     */
    publicKeyDecoder?: (text: string) => string[]
    payloadEncoder?: (payload: string) => string
    payloadDecoder?: (text: string) => string | null
    /**
     * This provider is not ready for production, Mask will not use it in production
     */
    notReadyForProduction?: boolean
    /**
     * Hint for partition when finding keys on Gun
     *
     * For Facebook.com, use ""
     * For network with a large number of users, use something like "twitter-"
     * For other networks, to keep the Anti-censor of the gun v2 design,
     * use string like "anonymous-"
     */
    gunNetworkHint: string
}

export type SocialNetworkWorkerAndUI = Required<SocialNetworkWorkerAndUIDefinition>

/**
 * Users settings about Mask
 */
export interface Preference {}

/**
 * The env that Mask running in
 */
export interface Env {
    // implementation: 'WebExtension' | 'chrome-extension' | 'holoflows-extension' | 'unknown'
}
export const env: Env = {}

export interface ProfileUI {
    bioContent: string
}
