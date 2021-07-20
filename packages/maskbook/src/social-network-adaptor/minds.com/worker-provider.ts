import type { SocialNetworkWorker } from '../../social-network'
import { mindsWorkerBase } from './base'
import { mindsShared } from './shared'
import { fetchPostContent, fetchProfile } from './worker/fetch'

const mindsWorker: SocialNetworkWorker.Definition = {
    ...mindsWorkerBase,
    ...mindsShared,
    tasks: {
        fetchPostContent,
        fetchProfile,
    },
}
export default mindsWorker
