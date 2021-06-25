import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import './rpc'
import './service'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal) {},
}

export default worker
