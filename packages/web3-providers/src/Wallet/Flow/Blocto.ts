import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, type ProviderType, createClient, type Web3Provider, type Web3 } from '@masknet/web3-shared-flow'
import type { WalletAPI } from '../../entry-types.js'
import { BaseProvider } from './Base.js'

export class BloctoProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    override createWeb3(options?: ProviderOptions<ChainId>) {
        return createClient(options?.chainId ?? ChainId.Mainnet)
    }

    override async connect(chainId = ChainId.Mainnet) {
        const fcl = this.createWeb3({
            chainId,
        })
        const user = await fcl.logIn()

        return {
            chainId,
            account: user.addr,
        }
    }

    override async disconnect() {
        // do nothing
    }
}
