import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'
import { fetchPostContentFacebook } from './Worker/fetchPostContent'
import { fetchProfileFacebook } from './Worker/fetchProfile'
import { autoVerifyBioFacebook } from './Worker/autoVerifyBio'
import { autoVerifyPostFacebook } from './Worker/autoVerifyPost'

export const facebookWorkerSelf = defineSocialNetworkWorker({
    ...sharedProvider,
    fetchPostContent: fetchPostContentFacebook,
    fetchProfile: fetchProfileFacebook,
    autoVerifyBio: autoVerifyBioFacebook,
    autoVerifyPost: autoVerifyPostFacebook,
})
