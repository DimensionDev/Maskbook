import { getDefaultChainId, getDefaultProviderType } from '@masknet/web3-shared-evm'
import type { ChainId, ProviderType, NetworkType, Transaction } from '@masknet/web3-shared-evm'
import { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'

export class ConnectionOptionsReadonlyAPI extends ConnectionOptionsAPI_Base<
    ChainId,
    ProviderType,
    NetworkType,
    Transaction
> {
    protected override getProvider = undefined
    protected override getDefaultChainId = getDefaultChainId
    protected override getDefaultProviderType = getDefaultProviderType
}
