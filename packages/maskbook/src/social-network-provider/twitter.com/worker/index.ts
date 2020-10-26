import { defineSocialNetworkWorker } from '../../../social-network/worker'
import { sharedSettings } from '../index'
import { fetchPostContent, fetchProfile } from './fetch'

export const twitterWorkerSelf = defineSocialNetworkWorker({
    ...sharedSettings,
    fetchPostContent,
    fetchProfile,
})
