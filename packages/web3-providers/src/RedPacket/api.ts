import type { RedPacketJSONPayloadFromChain, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { RedPacketBaseAPI } from '../entry-types.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { CREATE_LUCKY_DROP_TOPIC } from './constants.js'

export class ContractRedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    private Web3 = new ConnectionReadonlyAPI()

    async getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        fromBlock: number,
        toBlock: number,
    ): Promise<RedPacketJSONPayloadFromChain[] | undefined> {
        if (!senderAddress || !contractAddress || !fromBlock || !toBlock || !methodId) return

        const web3 = this.Web3.getWeb3({ chainId })

        const logs = await web3.eth.getPastLogs({
            topics: [CREATE_LUCKY_DROP_TOPIC],
            address: contractAddress,
            fromBlock,
            toBlock,
        })

        console.log({ logs, senderAddress, fromBlock, toBlock })

        return
    }
}
