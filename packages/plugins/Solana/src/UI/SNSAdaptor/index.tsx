import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { setupStorage, StorageDefaultValue } from '../../storage'
import { connectWallet, watchAccount } from '../../wallet'
import { createWeb3State } from '../Web3State'
import { Web3UI } from '../Web3UI'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupStorage(context.createKVStorage('persistent', StorageDefaultValue))
        sns.Web3State = createWeb3State(signal)
        await connectWallet(true)
        await watchAccount()
    },
    Web3UI,
}

export default sns
