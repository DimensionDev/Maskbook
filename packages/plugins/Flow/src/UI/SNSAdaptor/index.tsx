import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { createWeb3State } from '../Web3State'
import { setupStorage, StorageDefaultValue } from '../../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('persistent', StorageDefaultValue))
        sns.Web3State = createWeb3State(signal)
    },
    Web3UI,
}

export default sns
