import { memoize } from 'lodash-es'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionAPI_Base } from './ConnectionAPI.js'
import type { ConnectionOptions_Base, ConnectionOptionsAPI_Base } from './ConnectionOptionsAPI.js'

function resolver<ChainId, ProviderType, Transaction>(
    initial?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
) {
    return [initial?.chainId, initial?.account, initial?.providerType].join(',')
}

export function createConnectionCreator<T extends NetworkPluginID>(
    creator: (
        initial?: ConnectionOptions_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['Transaction']
        >,
    ) => ConnectionAPI_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['AddressType'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Signature'],
        Web3Helper.Definition[T]['Operation'],
        Web3Helper.Definition[T]['Transaction'],
        Web3Helper.Definition[T]['TransactionReceipt'],
        Web3Helper.Definition[T]['TransactionDetailed'],
        Web3Helper.Definition[T]['TransactionSignature'],
        Web3Helper.Definition[T]['Block'],
        Web3Helper.Definition[T]['Web3'],
        Web3Helper.Definition[T]['Web3Provider']
    >,
    isValidChainId: (chainId: Web3Helper.Definition[T]['ChainId']) => boolean,
    ConnectionOptions: ConnectionOptionsAPI_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['NetworkType'],
        Web3Helper.Definition[T]['Transaction']
    >,
) {
    const createCached = memoize(
        creator,
        resolver<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['Transaction']
        >,
    )
    return (
        initial?: ConnectionOptions_Base<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['Transaction']
        >,
    ) => {
        const options = ConnectionOptions.fill(initial)
        if (!isValidChainId(options.chainId)) return
        return createCached(initial)
    }
}
