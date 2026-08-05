import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-evm'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-evm'
import { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import { evm } from '../../../Manager/registry.js'
import type { ProviderState } from '@masknet/web3-shared-base'

export class ConnectionOptionsAPI extends ConnectionOptionsProvider<ChainId, ProviderType, NetworkType, Transaction> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType

    protected override getProvider(): ProviderState<ChainId, ProviderType, NetworkType> | undefined {
        return evm.state?.Provider
    }
}
