import type { Plugin } from '@masknet/plugin-infra/src'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    Web3UI,
}

export default sns
