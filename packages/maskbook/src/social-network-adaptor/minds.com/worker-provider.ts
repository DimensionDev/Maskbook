import type { SocialNetworkWorker } from '../../social-network'
import { mindsWorkerBase } from './base'
import { mindsShared } from './shared'

const mindsWorker: SocialNetworkWorker.Definition = {
    ...mindsWorkerBase,
    ...mindsShared,
    tasks: {},
}
export default mindsWorker
