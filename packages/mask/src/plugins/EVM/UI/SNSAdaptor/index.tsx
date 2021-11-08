import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { Web3Context } from '../Web3Context'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    Web3UI,
    Web3Context,
}

export default sns
