import { env, SocialNetworkWorkerAndUI } from './shared'
import { GetContext } from '@holoflows/kit/es'

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
}

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker>()
export function defineSocialNetworkWorker<T extends SocialNetworkWorker>(worker: T) {
    definedSocialNetworkWorkers.add(worker)
    if (GetContext() === 'background') {
        console.log('Activating social network provider', worker.networkIdentifier, worker)
        worker.init(env, {})
    }
}
