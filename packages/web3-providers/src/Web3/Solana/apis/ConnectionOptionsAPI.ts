import { getDefaultChainId, getDefaultProviderType, isValidChainId } from '@masknet/web3-shared-solana'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-solana'
import { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaConnectionOptionsAPI extends ConnectionOptionsProvider<
    ChainId,
    ProviderType,
    NetworkType,
    Transaction
> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType

    protected override getProvider() {
        return solana.state?.Provider
    }
}

export const createSolanaConnection = createConnectionCreator(
    NetworkPluginID.PLUGIN_SOLANA,
    (initial) => new SolanaConnectionAPI(initial),
    isValidChainId,
    new SolanaConnectionOptionsAPI(),
)
