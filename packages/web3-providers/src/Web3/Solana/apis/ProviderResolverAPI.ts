import { PROVIDER_DESCRIPTORS, type ChainId, type ProviderType } from '@masknet/web3-shared-solana'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'

export class SolanaProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(PROVIDER_DESCRIPTORS)
    }
}
