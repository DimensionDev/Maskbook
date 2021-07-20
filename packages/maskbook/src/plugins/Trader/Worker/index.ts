import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import '../messages'

const worker: Plugin.Worker.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
}
export default worker
