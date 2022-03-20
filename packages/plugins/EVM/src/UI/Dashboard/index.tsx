import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../SNSAdaptor/Web3UI'
import { createWeb3State } from '../SNSAdaptor/Web3State'
import { MemoryDefaultValue, PersistentDefaultValue, setupStorage } from '../../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupStorage('memory', context.createKVStorage('memory', MemoryDefaultValue))
        setupStorage('persistent', context.createKVStorage('persistent', PersistentDefaultValue))

        sns.Web3State = await createWeb3State(signal)
    },
    Web3UI,
}

export default sns
