import { PROVIDER_DESCRIPTORS, type ChainId, type ProviderType } from '@masknet/web3-shared-flow'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'

export class FlowProviderResolverAPI extends ProviderResolverAPI_Base<ChainId, ProviderType> {
    constructor() {
        super(PROVIDER_DESCRIPTORS)
    }
}
