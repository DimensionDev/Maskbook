import type { Plugin } from '@masknet/plugin-infra/src'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { Web3State } from '../Web3State'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    Web3UI,
    Web3State,
}

export default sns
