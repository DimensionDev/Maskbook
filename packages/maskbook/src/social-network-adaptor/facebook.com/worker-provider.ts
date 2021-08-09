import type { SocialNetworkWorker } from '../../social-network'
import { facebookWorkerBase } from './base'
import { facebookShared } from './shared'

const facebookWorker: SocialNetworkWorker.Definition = {
    ...facebookWorkerBase,
    ...facebookShared,
    tasks: {},
}
export default facebookWorker
