import { ChainId, createClient } from '@masknet/web3-shared-flow'
import type { FlowProvider } from '../types'
import { BaseProvider } from './Base'

export class BloctoProvider extends BaseProvider implements FlowProvider {
    override async createWeb3(chainId = ChainId.Mainnet) {
        return createClient(chainId)
    }

    override async connect(chainId = ChainId.Mainnet) {
        const fcl = await this.createWeb3(chainId)
        fcl.logIn()

        return {
            chainId,
            account: fcl.currentUser().addr ?? '',
        }
    }

    override async disconnect() {
        // do nothing
    }
}
