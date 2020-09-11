import { defineSocialNetworkWorker } from '../../../social-network/worker'
import { sharedSettings } from '../index'
import { fetchPostContent, fetchProfile } from './fetch'
import { autoVerifyPost } from './tasks'

export const twitterWorkerSelf = defineSocialNetworkWorker({
    ...sharedSettings,
    fetchPostContent,
    fetchProfile,
    autoVerifyPost,
    manualVerifyPost: null,
})
