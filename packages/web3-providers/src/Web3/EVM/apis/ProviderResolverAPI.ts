import { PROVIDER_DESCRIPTORS, type ChainId, type ProviderType } from '@masknet/web3-shared-evm'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'

export class ProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(PROVIDER_DESCRIPTORS)
    }
}
