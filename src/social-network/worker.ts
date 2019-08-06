import { env, SocialNetworkWorkerAndUI, Profile } from './shared'
import { GetContext } from '@holoflows/kit/es'
import { PostIdentifier, PersonIdentifier } from '../database/type'

/**
 * A SocialNetworkWorker is running in the background page
 */
export interface SocialNetworkWorker extends SocialNetworkWorkerAndUI {
    /**
     * If this worker need to inject script into the main context of the page
     */
    injectedScript?: {
        /** JavaScript code */
        code: string
        /** Inject to which URL */
        url: browser.events.UrlFilter[]
    }
    /**
     * This function should fetch the given post by `fetch`, `AutomatedTabTask` or anything
     * @param postIdentifier The post id
     */
    fetchPostContent(postIdentifier: PostIdentifier<PersonIdentifier>): Promise<string>
    /**
     * This function should fetch the given post by `fetch`, `AutomatedTabTask` or anything
     * @param postIdentifier The post id
     */
    fetchProfile(identifier: PersonIdentifier): Promise<Profile>
}

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker>()
export function defineSocialNetworkWorker(worker: SocialNetworkWorker) {
    definedSocialNetworkWorkers.add(worker)
    if (GetContext() === 'background') {
        console.log('Activating social network provider', worker.networkIdentifier, worker)
        worker.init(env, {})
    }
}
export function defineSocialNetworkWorkerExtended<T extends SocialNetworkWorker>(worker: T) {
    defineSocialNetworkWorker(worker)
}
