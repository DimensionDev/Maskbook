import type { Plugin } from '@masknet/plugin-infra'
import '../messages'
import { base } from '../base'

const worker: Plugin.Worker.Definition = {
    ...base,
    init() {},
}
export default worker
