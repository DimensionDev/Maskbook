import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import './rpc'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal) {},
}

export default worker
