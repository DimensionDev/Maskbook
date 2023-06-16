import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import '../messages.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        console.log('DEBUG: worker context')
        console.log(context)
    },
}
export default worker
