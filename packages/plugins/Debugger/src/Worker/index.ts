import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
    },
}

export default worker
