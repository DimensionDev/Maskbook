import { env, ProfileUI, SocialNetworkWorkerAndUIDefinition } from './shared'
import { GetContext } from '@dimensiondev/holoflows-kit/es'
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
}

export type SocialNetworkWorker = Required<SocialNetworkWorkerDefinition>
export const getNetworkWorker = getCurrentNetworkWorker

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker>()
export function defineSocialNetworkWorker(worker: SocialNetworkWorkerDefinition) {
    if (
        (worker.acceptablePayload.includes('v40') || worker.acceptablePayload.includes('v39')) &&
        worker.internalName !== 'facebook'
    ) {
        throw new TypeError('Payload version v40 or v39 is not supported in this network. Please use v38 or newer.')
    }

    const res: SocialNetworkWorker = {
        ...defaultSharedSettings,
        ...worker,
    }

    if (worker.notReadyForProduction) {
        if (process.env.NODE_ENV === 'production') return res
    }

    definedSocialNetworkWorkers.add(res)
    if (GetContext() === 'background') {
        console.log('Activating social network provider', res.networkIdentifier, worker)
        res.init(env, {})
    }
    return res
}
