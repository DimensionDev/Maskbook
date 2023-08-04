import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { createIndicator, createPageable, type PageIndicator, type Pageable, EMPTY_LIST } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import {
    type RedPacketJSONPayloadFromChain,
    type CreateRedpacketParam,
    type NftRedPacketJSONPayload,
    type CreateNFTRedpacketParam,
} from './types.js'
import { Interface } from '@ethersproject/abi'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import { ChainResolverAPI } from '../Web3/EVM/apis/ResolverAPI.js'
import { ContractRedPacketAPI } from './api.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacketAPI } from '../Etherscan/index.js'
import type { HubOptions_Base, RedPacketBaseAPI } from '../entry-types.js'

const redPacketInterFace = new Interface(REDPACKET_ABI)
const nftRedPacketInterFace = new Interface(NFT_REDPACKET_ABI)

export class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    private ChainbaseRedPacket = new ChainbaseRedPacketAPI()
    private EtherscanRedPacket = new EtherscanRedPacketAPI()
    private ContractRedPacket = new ContractRedPacketAPI()

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
                async () =>
                    this.ContractRedPacket.getHistories(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        fromBlock,
                        endBlock,
                    ),
                async () =>
                    this.parseRedPacketCreationTransactions(
                        await this.getHistoryTransactions(
                            chainId,
                            senderAddress,
                            contractAddress,
                            methodId,
                            fromBlock,
                            endBlock,
                        ),
                        senderAddress,
                    ),
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
        return this.parseNFTRedPacketCreationTransactions(
            await this.getHistoryTransactions(chainId, senderAddress, contractAddress, methodId, fromBlock, endBlock),
            senderAddress,
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
        return attemptUntil(
            [
                async () =>
                    await this.EtherscanRedPacket.getHistoryTransactions(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        fromBlock,
                        endBlock,
                    ),

                async () =>
                    await this.ChainbaseRedPacket.getHistoryTransactions(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                    ),
            ],
            [],
        )
    }

    async getCollectionsByOwner(
        account: string,
        { chainId, indicator }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const result = await fetchFromDSearch<{
            [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType>>
        }>(urlcat(DSEARCH_BASE_URL, '/nft-lucky-drop/specific-list.json'))
        const list = mapKeys(result, (_v, k) => k.toLowerCase())?.[account.toLowerCase()].filter(
            (x) => x.chainId === chainId,
        )
        return createPageable(list, createIndicator(indicator))
    }

    private parseNFTRedPacketCreationTransactions(
        transactions: Array<Transaction<ChainId, SchemaType>> | undefined,
        senderAddress: string,
    ): NftRedPacketJSONPayload[] {
        if (!transactions) return EMPTY_LIST

        return transactions.flatMap((tx) => {
            try {
                const decodedInputParam = nftRedPacketInterFace.decodeFunctionData(
                    'create_red_packet',
                    tx.input ?? '',
                ) as unknown as CreateNFTRedpacketParam

                const redpacketPayload: NftRedPacketJSONPayload = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    contract_version: 1,
                    shares: decodedInputParam._erc721_token_ids.length,
                    network: new ChainResolverAPI().networkType(tx.chainId),
                    token_address: decodedInputParam._token_addr,
                    chainId: tx.chainId,
                    sender: {
                        address: senderAddress,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    duration: decodedInputParam._duration.toNumber() * 1000,
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
                return EMPTY_LIST
            }
        })
    }

    private parseRedPacketCreationTransactions(
        transactions: Array<Transaction<ChainId, SchemaType>> | undefined,
        senderAddress: string,
    ): RedPacketJSONPayloadFromChain[] {
        if (!transactions) return EMPTY_LIST

        return transactions.flatMap((tx) => {
            try {
                const decodedInputParam = redPacketInterFace.decodeFunctionData(
                    'create_red_packet',
                    tx.input ?? '',
                ) as unknown as CreateRedpacketParam

                const redpacketPayload: RedPacketJSONPayloadFromChain = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    chainId: tx.chainId,
                    shares: decodedInputParam._number.toNumber(),
                    is_random: decodedInputParam._ifrandom,
                    total: decodedInputParam._total_tokens.toString(),
                    duration: decodedInputParam._duration.toNumber() * 1000,
                    block_number: Number(tx.blockNumber),
                    contract_version: 4,
                    network: new ChainResolverAPI().networkType(tx.chainId),
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
                return EMPTY_LIST
            }
        })
    }
}
