import {
    type RedPacketJSONPayloadFromChain,
    type ChainId,
    type SchemaType,
    chainResolver,
} from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import type { RedPacketBaseAPI } from '../entry-types.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { CREATE_LUCKY_DROP_TOPIC } from './constants.js'

const creationSuccessTopicInputs = REDPACKET_ABI.find((x) => x.name === 'CreationSuccess')?.inputs!

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

        return logs.map((log) => {
            const result = web3.eth.abi.decodeLog(creationSuccessTopicInputs, log.data, [
                CREATE_LUCKY_DROP_TOPIC,
            ]) as unknown as {
                creation_time: string // 10
                creator: string
                duration: string // 86400
                id: string
                ifrandom: boolean
                message: string
                name: string
                number: string
                token_address: string
                total: string
            }

            return {
                contract_address: contractAddress,
                txid: log.transactionHash,
                chainId,
                shares: Number(result.number),
                is_random: result.ifrandom,
                total: result.total,
                duration: secondsToMilliseconds(Number(result.duration)),
                block_number: log.blockNumber,
                contract_version: 4,
                network: chainResolver.networkType(chainId),
                token_address: result.token_address,
                sender: {
                    address: senderAddress,
                    name: result.name,
                    message: result.message,
                },
                rpid: result.id,
                creation_time: secondsToMilliseconds(Number(result.creation_time)),
                // #region Retrieve at RedPacketInHistoryList component
                total_remaining: '',
                // #endregion
                // #region Retrieve from database
                password: '',
                // #endregion
            } as RedPacketJSONPayloadFromChain
        })
    }
}
