import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'
import { fetchPostContentFacebook } from './Worker/fetchPostContent'
import { fetchProfileFacebook } from './Worker/fetchProfile'
import { autoVerifyBioFacebook } from './Worker/autoVerifyBio'
import { autoVerifyPostFacebook } from './Worker/autoVerifyPost'
import { is_iOSApp } from '../../utils/constants'

export const facebookWorkerSelf = defineSocialNetworkWorker({
    ...sharedProvider,
    fetchPostContent: fetchPostContentFacebook,
    fetchProfile: fetchProfileFacebook,
    autoVerifyBio: is_iOSApp ? null : autoVerifyBioFacebook,
    autoVerifyPost: autoVerifyPostFacebook,
    manualVerifyPost: null,
})
