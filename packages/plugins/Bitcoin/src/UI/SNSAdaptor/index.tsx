import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    MessageRequest,
    MessageResponse,
    SchemaType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { SharedPluginContext, BitcoinWeb3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const sns: Plugin.SiteAdaptor.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await BitcoinWeb3State.create(context)

        BitcoinWeb3State.setup(state)
        sns.Web3State = BitcoinWeb3State.state
    },
}

export default sns
