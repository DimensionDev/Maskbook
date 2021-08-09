import type { SocialNetworkWorker } from '../../social-network'
import { twitterWorkerBase } from './base'
import { twitterShared } from './shared'

const twitterWorker: SocialNetworkWorker.Definition = {
    ...twitterWorkerBase,
    ...twitterShared,
    tasks: {},
}
export default twitterWorker
