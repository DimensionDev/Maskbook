import type { ChainId, ProviderType, Web3Provider, Web3 } from '@masknet/web3-shared-flow'
import type { WalletAPI } from '../../entry-types.js'
import { BaseProvider } from './Base.js'

export class DapperProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}
