import { ChainId, createClient } from '@masknet/web3-shared-flow'
import { BaseFlowWalletProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export class FlowBloctoProvider extends BaseFlowWalletProvider {
    override createWeb3(options?: WalletAPI.ProviderOptions<ChainId>) {
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
