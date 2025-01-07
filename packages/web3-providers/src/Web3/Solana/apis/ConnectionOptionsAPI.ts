import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { getDefaultChainId, getDefaultProviderType, isValidChainId } from '@masknet/web3-shared-solana'
import type { VersionedTransaction } from '@solana/web3.js'
import { solana } from '../../../Manager/registry.js'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'
import { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import { SolanaConnectionAPI } from './ConnectionAPI.js'

export class SolanaConnectionOptionsAPI extends ConnectionOptionsProvider<
    ChainId,
    ProviderType,
    NetworkType,
    VersionedTransaction
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
