import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        context.startService(import('./rpc.js'))
    },
}
export default worker
