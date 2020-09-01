import { defineSocialNetworkWorker } from '../../social-network/worker'
import { sharedProvider } from './shared-provider'
import { fetchPostContentFacebook } from './Worker/fetchPostContent'
import { fetchProfileFacebook } from './Worker/fetchProfile'
import { autoVerifyBioFacebook } from './Worker/autoVerifyBio'
import { autoVerifyPostFacebook } from './Worker/autoVerifyPost'
import { Flags } from '../../utils/flags'

export const facebookWorkerSelf = defineSocialNetworkWorker({
    ...sharedProvider,
    fetchPostContent: fetchPostContentFacebook,
    fetchProfile: fetchProfileFacebook,
    autoVerifyBio: Flags.no_auto_verify_bio ? null : autoVerifyBioFacebook,
    autoVerifyPost: autoVerifyPostFacebook,
    manualVerifyPost: null,
})
