import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import { abiCoder, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { ChainResolverAPI } from '../Web3/EVM/apis/ResolverAPI.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import type { RedPacketJSONPayloadFromChain } from './types.js'
import { CREATE_LUCKY_DROP_TOPIC } from './constants.js'
import type { RedPacketBaseAPI } from '../entry-types.js'
import { isSameAddress } from '@masknet/web3-shared-base'

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

        const logs = await this.Web3.getWeb3({ chainId }).eth.getPastLogs({
            topics: [CREATE_LUCKY_DROP_TOPIC],
            address: contractAddress,
            fromBlock,
            toBlock,
        })

        return logs
            .map((log) => {
                const result = abiCoder.decodeLog(creationSuccessTopicInputs, log.data, [
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

                return { result, log }
            })
            .filter((x) => isSameAddress(x.result.creator, senderAddress))
            .map(
                (x) =>
                    ({
                        contract_address: contractAddress,
                        txid: x.log.transactionHash,
                        chainId,
                        shares: Number(x.result.number),
                        is_random: x.result.ifrandom,
                        total: x.result.total,
                        duration: secondsToMilliseconds(Number(x.result.duration)),
                        block_number: x.log.blockNumber,
                        contract_version: 4,
                        network: new ChainResolverAPI().networkType(chainId),
                        token_address: x.result.token_address,
                        sender: {
                            address: senderAddress,
                            name: x.result.name,
                            message: x.result.message,
                        },
                        rpid: x.result.id,
                        creation_time: secondsToMilliseconds(Number(x.result.creation_time)),
                        // #region Retrieve at RedPacketInHistoryList component
                        total_remaining: '',
                        // #endregion
                        // #region Retrieve from database
                        password: '',
                        // #endregion
                    }) as RedPacketJSONPayloadFromChain,
            )
    }
}
