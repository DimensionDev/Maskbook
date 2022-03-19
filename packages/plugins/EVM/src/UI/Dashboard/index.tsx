import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { setupMemory, MemoryDefaultValue, PersistentDefaultValue } from '../../storage'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupMemory(context.createKVStorage('memory', MemoryDefaultValue))
        setupMemory(context.createKVStorage('persistent', PersistentDefaultValue))
    },
    Web3UI,
    Web3State: {},
}

export default sns
