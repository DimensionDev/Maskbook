import { ChainId, createClient } from '@masknet/web3-shared-flow'
import { BaseFlowWalletProvider } from './Base.js'

export class FlowBloctoProvider extends BaseFlowWalletProvider {
    override async connect(chainId = ChainId.Mainnet) {
        const fcl = createClient(chainId)
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
