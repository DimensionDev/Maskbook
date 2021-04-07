import type { SocialNetworkWorker } from '../../social-network'
import { facebookWorkerBase } from './base'
import { facebookShared } from './shared'
import { fetchPostContentFacebook } from './worker/fetchPostContent'
import { fetchProfileFacebook } from './worker/fetchProfile'

const facebookWorker: SocialNetworkWorker.Definition = {
    ...facebookWorkerBase,
    ...facebookShared,
    tasks: {
        fetchPostContent: fetchPostContentFacebook,
        fetchProfile: fetchProfileFacebook,
    },
}
export default facebookWorker
