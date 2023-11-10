import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-flow'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptions.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'

export type FlowConnectionOptions = BaseConnectionOptions<ChainId, ProviderType, Transaction>
export type FlowHubOptions = BaseHubOptions<ChainId>
