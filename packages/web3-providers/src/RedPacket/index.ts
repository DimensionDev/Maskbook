import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { createIndicator, createPageable, type PageIndicator, type Pageable, EMPTY_LIST } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { chainResolver } from '@masknet/web3-shared-evm'
import type { ChainId, RedPacketJSONPayloadFromChain, SchemaType, CreateRedpacketParam } from '@masknet/web3-shared-evm'
import { Interface } from '@ethersproject/abi'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import { ContractRedPacketAPI } from './api.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacketAPI } from '../Etherscan/index.js'
import type { HubOptions_Base, RedPacketBaseAPI } from '../entry-types.js'

const redPacketInterFace = new Interface(REDPACKET_ABI)

export class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    private ChainbaseRedPacket = new ChainbaseRedPacketAPI()
    private EtherscanRedPacket = new EtherscanRedPacketAPI()
    private ContractRedPacket = new ContractRedPacketAPI()

    getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock: number,
        endBlock: number,
    ): Promise<RedPacketJSONPayloadFromChain[] | undefined> {
        return attemptUntil(
            [
                // async () =>
                //     this.ContractRedPacket.getHistories(
                //         chainId,
                //         senderAddress,
                //         contractAddress,
                //         methodId,
                //         startBlock,
                //         endBlock,
                //     ),
                async () =>
                    this.parseRedPacketCreationTransactions(
                        await this.EtherscanRedPacket.getHistoryTransactions(
                            chainId,
                            senderAddress,
                            contractAddress,
                            methodId,
                            startBlock,
                            endBlock,
                        ),
                        senderAddress,
                    ),
                async () =>
                    this.parseRedPacketCreationTransactions(
                        await this.ChainbaseRedPacket.getHistoryTransactions(
                            chainId,
                            senderAddress,
                            contractAddress,
                            methodId,
                        ),
                        senderAddress,
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
                    network: chainResolver.networkType(tx.chainId),
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
