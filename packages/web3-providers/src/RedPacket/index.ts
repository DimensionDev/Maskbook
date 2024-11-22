import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { attemptUntil, type Transaction } from '@masknet/web3-shared-base'
import { decodeFunctionParams, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { sortBy } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacket } from '../Etherscan/index.js'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import type { RedPacketBaseAPI } from '../entry-types.js'
import { ContractRedPacket } from './api.js'
import { type RedPacketJSONPayloadFromChain } from './types.js'

function toNumber(val: any) {
    if (typeof val.toNumber === 'function') return val.toNumber()
    return typeof val === 'string' ? Number.parseInt(val, 10) : val
}

class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        fromBlock: number,
        endBlock: number,
    ): Promise<RedPacketJSONPayloadFromChain[] | undefined> {
        return attemptUntil(
            [
                async () => {
                    const transactions = await this.getHistoryTransactions(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        fromBlock,
                        endBlock,
                    )
                    return this.parseRedPacketCreationTransactions(transactions, senderAddress)
                },
                async () => {
                    // block range might be too large
                    const results = await ContractRedPacket.getHistories(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        fromBlock,
                        endBlock,
                    )
                    return sortBy(results, (x) => -x.block_number!)
                },
            ],
            [],
        )
    }

    async getHistoryTransactions(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        fromBlock: number,
        endBlock: number,
    ) {
        const attempts = [
            () => {
                return EtherscanRedPacket.getHistoryTransactions(
                    chainId,
                    senderAddress,
                    contractAddress,
                    methodId,
                    fromBlock,
                    endBlock,
                )
            },
        ]
        if (ChainbaseRedPacketAPI.isSupportedChain(chainId)) {
            attempts.unshift(() => {
                return ChainbaseRedPacketAPI.getHistoryTransactions(chainId, senderAddress, contractAddress, methodId)
            })
        }
        return attemptUntil(attempts, [])
    }

    private parseRedPacketCreationTransactions(
        transactions: Array<Transaction<ChainId, SchemaType>> | undefined,
        senderAddress: string,
    ): RedPacketJSONPayloadFromChain[] {
        if (!transactions) return []

        return transactions.flatMap((tx) => {
            try {
                const decodedInputParam = decodeFunctionParams(
                    REDPACKET_ABI as AbiItem[],
                    tx.input ?? '',
                    'create_red_packet',
                )

                const redpacketPayload: RedPacketJSONPayloadFromChain = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    chainId: tx.chainId,
                    shares: toNumber(decodedInputParam._number),
                    is_random: decodedInputParam._ifrandom,
                    total: decodedInputParam._total_tokens.toString(),
                    duration: toNumber(decodedInputParam._duration) * 1000,
                    block_number: Number(tx.blockNumber),
                    contract_version: 4,
                    network: EVMChainResolver.networkType(tx.chainId),
                    token_address: decodedInputParam._token_addr,
                    sender: {
                        address: senderAddress,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    // #region Retrieve at RedPacketInHistoryList component
                    rpid: '',
                    creation_time: 0,
                    total_remaining: '',
                    // #endregion
                    // #region Retrieve from database
                    password: '',
                    // #endregion
                }
                return redpacketPayload
            } catch {
                return []
            }
        })
    }
}
export const RedPacket = new RedPacketAPI()
export { CREATE_LUCKY_DROP_TOPIC } from './constants.js'
