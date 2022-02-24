import type { SocialNetworkWorker } from '../../social-network'
import { openseaWorkerBase } from './base'
import { openseaShared } from './shared'

const openseaWorker: SocialNetworkWorker.Definition = {
    ...openseaWorkerBase,
    ...openseaShared,
    tasks: {},
}
export default openseaWorker
