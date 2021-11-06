import type { Plugin } from '@masknet/plugin-infra/src'
import { base } from '../../base'
import { Web3UIProvider } from '../Web3UIProvider'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    Web3UIProvider,
}

export default sns
