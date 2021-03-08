export interface SocialNetworkWorkerAndUIDefinition {
    /**
     * This name is used internally and should be unique
     */
    name: string
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
    init(): void
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
}

export type SocialNetworkWorkerAndUI = Required<SocialNetworkWorkerAndUIDefinition>

export interface ProfileUI {
    bioContent: string
}
