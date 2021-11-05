import type { Plugin } from '@masknet/plugin-infra/src'
import { base } from '../../base'
import { Web3Provider } from '../Web3Provider'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    Web3Provider,
}

export default sns
