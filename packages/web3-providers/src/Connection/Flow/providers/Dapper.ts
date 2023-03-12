import type { ChainId, ProviderType, Web3Provider, Web3 } from '@masknet/web3-shared-flow'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export class DapperProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}
