import type { SocialNetworkWorker } from '../../social-network'
import { twitterWorkerBase } from './base'
import { twitterShared } from './shared'
import { fetchPostContent, fetchProfile } from './worker/fetch'

const twitterWorker: SocialNetworkWorker.Definition = {
    ...twitterWorkerBase,
    ...twitterShared,
    tasks: {
        fetchPostContent,
        fetchProfile,
    },
}
export default twitterWorker
