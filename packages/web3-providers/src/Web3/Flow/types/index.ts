import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-flow'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptionsAPI.js'

export type FlowConnectionOptions = BaseConnectionOptions<ChainId, ProviderType, Transaction>
export type FlowHubOptions = BaseHubOptions<ChainId>
