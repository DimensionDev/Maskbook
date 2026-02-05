import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { createIndicator, createPageable, type PageIndicator, type Pageable } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { decodeFunctionParams, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { NftRedPacketAbi } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacket } from '../Etherscan/index.js'
import type { NftRedPacketJSONPayload } from './types.js'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import type { BaseHubOptions, RedPacketBaseAPI } from '../entry-types.js'
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype'

function mapCreateNFTRedpacketParam(
    value: AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<NftRedPacketAbi, 'create_red_packet'>['inputs'],
        'inputs',
        true
    >,
) {
    const [_public_key, _duration, _seed, _message, _name, _token_addr, _erc721_token_ids] = value
    return { _public_key, _duration, _seed, _message, _name, _token_addr, _erc721_token_ids }
}
class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
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
                const decodedInputParam = mapCreateNFTRedpacketParam(
                    decodeFunctionParams(NftRedPacketAbi, tx.input as `0x${string}`, 'create_red_packet'),
                )

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
                    duration: Number(decodedInputParam._duration * 1000n),
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
}
export const RedPacket = new RedPacketAPI()
