import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UIProvider } from '../Web3UIProvider'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    Web3UIProvider,
}

export default sns
