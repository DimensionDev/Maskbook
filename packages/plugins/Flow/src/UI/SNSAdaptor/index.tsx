import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { Web3State } from '../Web3State'
import { setupStorage, StorageDefaultValue } from '../../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('persistent', StorageDefaultValue))
    },
    Web3UI,
    Web3State,
}

export default sns
