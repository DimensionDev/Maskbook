import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { base } from '../base'
import '../messages'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal) {},
}
export default worker
