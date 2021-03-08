import type { ProfileUI, SocialNetworkWorkerAndUIDefinition } from './shared'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { ProfileIdentifier, PostIdentifier } from '../database/type'
import { defaultSharedSettings } from './defaults/shared'
import getCurrentNetworkWorker from './utils/getCurrentNetworkWorker'

/**
 * A SocialNetworkWorker is running in the background page
 */
export interface SocialNetworkWorkerDefinition extends SocialNetworkWorkerAndUIDefinition {
    /**
     * This function should fetch the given post by `fetch`, `AutomatedTabTask` or anything
     * @pseudoCode
     * fetchPostContent(post) {
     *      let tab = get_tab_with_same_origin_and_not_pinned()
     *      if (!isUndefined(tab)) {
     *          // tab available, let them to fetch.
     *          // this process should not visible to user.
     *          return tasks(tab).fetch(url)
     *      }
     *
     *      // no tab available for now, call foreground to do so.
     *      return tasks(getPostURL(post)).getPostContent()
     * }
     * @param postIdentifier The post id
     */
    fetchPostContent(postIdentifier: PostIdentifier<ProfileIdentifier>): Promise<string>
    /**
     * This function should fetch the given post by `fetch`, `AutomatedTabTask` or anything
     * @param identifier The post id
     */
    fetchProfile(identifier: ProfileIdentifier): Promise<ProfileUI>
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

export type SocialNetworkWorker = Required<SocialNetworkWorkerDefinition>
export const getNetworkWorker = getCurrentNetworkWorker

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker>()
export function defineSocialNetworkWorker(worker: SocialNetworkWorkerDefinition) {
    const res: SocialNetworkWorker = {
        ...defaultSharedSettings,
        ...worker,
    }

    if (worker.notReadyForProduction) {
        if (process.env.NODE_ENV === 'production') return res
    }

    definedSocialNetworkWorkers.add(res)
    if (isEnvironment(Environment.ManifestBackground)) {
        console.log('Activating social network provider', res.networkIdentifier, worker)
        res.init()
    }
    return res
}
