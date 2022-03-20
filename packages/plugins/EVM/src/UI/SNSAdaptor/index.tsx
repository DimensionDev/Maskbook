import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../components/Web3UI'
import { createWeb3State } from '../components/Web3State'
import { GlobalInjection } from '../components/GlobalInjection'
import { MemoryDefaultValue, PersistentDefaultValue, setupStorage } from '../../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupStorage('memory', context.createKVStorage('memory', MemoryDefaultValue))
        setupStorage('persistent', context.createKVStorage('persistent', PersistentDefaultValue))

        sns.Web3State = await createWeb3State(signal)
    },
    Web3UI,
    GlobalInjection,
}

export default sns
