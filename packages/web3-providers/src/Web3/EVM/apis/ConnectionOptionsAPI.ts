import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-evm'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-evm'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'

export class ConnectionOptionsAPI extends ConnectionOptionsAPI_Base<ChainId, ProviderType, NetworkType, Transaction> {
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType
    protected override getProvider() {
        return Web3StateRef.value?.Provider
    }
}
