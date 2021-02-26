import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'
import { fetchPostContentFacebook } from './Worker/fetchPostContent'
import { fetchProfileFacebook } from './Worker/fetchProfile'

export const facebookWorkerSelf = defineSocialNetworkWorker({
    ...sharedProvider,
    fetchPostContent: fetchPostContentFacebook,
    fetchProfile: fetchProfileFacebook,
    gunNetworkHint: '',
})
