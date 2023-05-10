import { ProviderType, type ChainId, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import type { WalletAPI } from '../../../entry-types.js'
import { BaseProvider } from './Base.js'

export default class WalletConnectV2Provider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.WalletConnectV2)
    }
}
