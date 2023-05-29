import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { ConnectionOptions_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'

export type ConnectionOptions = ConnectionOptions_Base<ChainId, ProviderType, Transaction>
export type HubOptions = HubOptions_Base<ChainId>
