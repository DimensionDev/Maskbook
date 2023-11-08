import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-solana'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-solana'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreatorAPI.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'
import { SolanaOthersAPI } from './OthersAPI.js'

export class SolanaConnectionOptionsAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    ProviderType,
    NetworkType,
    Transaction
> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getProvider() {
        return SolanaWeb3StateRef.value.Provider
    }
}
export const createSolanaConnection = createConnectionCreator<NetworkPluginID.PLUGIN_SOLANA>(
    (initial) => new SolanaConnectionAPI(initial),
    SolanaOthersAPI.isValidChainId,
    new SolanaConnectionOptionsAPI(),
)
