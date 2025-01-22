import type { ChainId, NetworkType, ProviderType, Transaction } from '@masknet/web3-shared-solana'
import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-solana'
import { solana } from '../../../Manager/registry.js'
import { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'

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
