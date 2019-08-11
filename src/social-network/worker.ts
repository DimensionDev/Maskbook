import { env, Profile, SocialNetworkWorkerAndUI } from './shared'
import { GetContext } from '@holoflows/kit/es'
import { PersonIdentifier, PostIdentifier } from '../database/type'
import { startWorkerService } from '../extension/background-script/WorkerService'

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
     * @param identifier The post id
     */
    fetchProfile(identifier: PersonIdentifier): Promise<Profile>
    /**
     * This function should open a new page, then automatically input provePost to bio
     *
     * If this function is not provided, autoVerifyBio in Welcome will be unavailable
     */
    autoVerifyBio?(user: PersonIdentifier, provePost: string): void
    /**
     * This function should open a new page, then automatically input provePost to the post box
     *
     * If this function is not provided, autoVerifyPost in Welcome will be unavailable
     */
    autoVerifyPost?(user: PersonIdentifier, provePost: string): void
    /**
     * This function should open a new page, then let user add it by themself
     *
     * If this function is not provided, manualVerifyPost in Welcome will be unavailable
     */
    manualVerifyPost?(user: PersonIdentifier, provePost: string): void
}

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker>()
export function defineSocialNetworkWorker(worker: SocialNetworkWorker) {
    definedSocialNetworkWorkers.add(worker)
    if (GetContext() === 'background') {
        console.log('Activating social network provider', worker.networkIdentifier, worker)
        worker.init(env, {})
        startWorkerService(worker)
    }
}
export function defineSocialNetworkWorkerExtended<T extends SocialNetworkWorker>(worker: T) {
    defineSocialNetworkWorker(worker)
}
