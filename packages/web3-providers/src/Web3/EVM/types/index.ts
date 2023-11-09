import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptionsAPI.js'

export type EVMConnectionOptions = BaseConnectionOptions<ChainId, ProviderType, Transaction>
export type EVMHubOptions = BaseHubOptions<ChainId>
