import type { SocialNetworkWorker } from '../../social-network-next'
import { facebookWorkerBase } from './base'
import { facebookShared } from './shared'
import { fetchPostContentFacebook } from './Worker/fetchPostContent'
import { fetchProfileFacebook } from './Worker/fetchProfile'

const facebookWorker: SocialNetworkWorker.Definition = {
    ...facebookWorkerBase,
    ...facebookShared,
    tasks: {
        fetchPostContent: fetchPostContentFacebook,
        fetchProfile: fetchProfileFacebook,
    },
}
export default facebookWorker
