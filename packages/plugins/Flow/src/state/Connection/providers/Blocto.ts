import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, createClient } from '@masknet/web3-shared-flow'
import type { FlowProvider } from '../types.js'
import { BaseProvider } from './Base.js'

export class BloctoProvider extends BaseProvider implements FlowProvider {
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
