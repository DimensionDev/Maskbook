import type { Plugin } from '@masknet/plugin-infra'
import '../messages.js'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init() {},
}
export default worker
