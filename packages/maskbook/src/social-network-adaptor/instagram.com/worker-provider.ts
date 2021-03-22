import type { SocialNetworkWorker } from '../../social-network'
import { instagramWorkerBase } from './base'
import { instagramShared } from './shared'
const define: SocialNetworkWorker.Definition = {
    ...instagramWorkerBase,
    ...instagramShared,
    tasks: {},
}
export default define
