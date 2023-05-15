import type { AuthorizationAPI } from '../entry-types.js'
import { type ChainId } from '@masknet/web3-shared-evm'
import { approvalListState } from './approvalListState.js'
import { Web3API } from '../Connection/index.js'
import { TOKEN_APPROVAL_TOPIC } from './constants.js'

export class ApprovalAPI implements AuthorizationAPI.Provider<ChainId> {
    private Web3 = new Web3API()

    private createWeb3(chainId: ChainId) {
        return this.Web3.getWeb3(chainId)
    }

    async getFungibleTokenSpenders(chainId: ChainId, account: string) {
        try {
            const web3 = this.createWeb3(chainId)
            const fromBlock = approvalListState.tokenState[account]?.[chainId]?.fromBlock ?? 0
            const toBlock = await web3.eth.getBlockNumber()
            const logs = await web3.eth.getPastLogs({
                topics: [TOKEN_APPROVAL_TOPIC, web3.eth.abi.encodeParameter('address', account)],
                fromBlock,
                toBlock,
            })
            return []
        } catch (error) {
            console.log(error, 'error')
            return []
        }
    }
}
