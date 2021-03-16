import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'
import { fetchPostContentFacebook } from './worker/fetchPostContent'
import { fetchProfileFacebook } from './worker/fetchProfile'

export const facebookWorkerSelf = defineSocialNetworkWorker({
    ...sharedProvider,
    fetchPostContent: fetchPostContentFacebook,
    fetchProfile: fetchProfileFacebook,
    gunNetworkHint: '',
})
