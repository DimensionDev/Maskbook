import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3Provider } from '../Web3Provider'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    Web3Provider,
}

export default sns
