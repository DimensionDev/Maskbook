import urlcat from 'urlcat'
import { mapKeys, sortBy } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { createIndicator, createPageable, type PageIndicator, type Pageable } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { decodeFunctionParams, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json' with { type: 'json' }
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json' with { type: 'json' }
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacket } from '../Etherscan/index.js'
import { ContractRedPacket } from './api.js'
import {
    type RedPacketJSONPayloadFromChain,
    type NftRedPacketJSONPayload,
    type CreateNFTRedpacketParam,
} from './types.js'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import type { BaseHubOptions, RedPacketBaseAPI } from '../entry-types.js'

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

    async getNFTHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        fromBlock: number,
        endBlock: number,
    ): Promise<NftRedPacketJSONPayload[] | undefined> {
        const transactions = await this.getHistoryTransactions(
            chainId,
            senderAddress,
            contractAddress,
            methodId,
            fromBlock,
            endBlock,
        )
        return this.parseNFTRedPacketCreationTransactions(transactions, senderAddress)
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

    async getCollectionsByOwner(
        account: string,
        { chainId, indicator }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const result = await fetchFromDSearch<{
            [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType>>
        }>(urlcat(DSEARCH_BASE_URL, '/nft-lucky-drop/specific-list.json'))
        const list = mapKeys(result, (_v, k) => k.toLowerCase())[account.toLowerCase()].filter(
            (x) => x.chainId === chainId,
        )
        return createPageable(list, createIndicator(indicator))
    }

    private parseNFTRedPacketCreationTransactions(
        transactions: Array<Transaction<ChainId, SchemaType>> | undefined,
        senderAddress: string,
    ): NftRedPacketJSONPayload[] {
        if (!transactions) return []

        return transactions.flatMap((tx) => {
            if (!tx.input) return []
            try {
                const decodedInputParam = decodeFunctionParams(
                    NFT_REDPACKET_ABI as AbiItem[],
                    tx.input,
                    'create_red_packet',
                ) as CreateNFTRedpacketParam

                const redpacketPayload: NftRedPacketJSONPayload = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    contract_version: 1,
                    shares: decodedInputParam._erc721_token_ids.length,
                    network: EVMChainResolver.networkType(tx.chainId),
                    token_address: decodedInputParam._token_addr,
                    chainId: tx.chainId,
                    sender: {
                        address: senderAddress,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    duration: toNumber(decodedInputParam._duration) * 1000,
                    token_ids: decodedInputParam._erc721_token_ids.map((x) => x.toString()),
                    // #region Retrieve at NFT History List Item.
                    rpid: '',
                    creation_time: 0,
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
