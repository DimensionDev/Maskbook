import { ProviderType, type ChainId } from '@masknet/web3-shared-flow'
import { FlowNoneProvider } from './None.js'
import { FlowBloctoProvider } from './Blocto.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface FlowWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {}

export function createFlowWalletProviders(): Record<ProviderType, FlowWalletProvider> {
    return {
        [ProviderType.None]: new FlowNoneProvider(),
        [ProviderType.Blocto]: new FlowBloctoProvider(),
    }
}
