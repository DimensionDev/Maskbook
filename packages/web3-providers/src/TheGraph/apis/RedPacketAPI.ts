import { type ChainId } from '@masknet/web3-shared-evm'
import { REDPACKET_API_URL, NFT_REDPACKET_API_URL } from '../constants.js'
import { EVMChainResolver } from '../../Web3/EVM/apis/ResolverAPI.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { NftRedPacketJSONPayload, RedPacketJSONPayloadFromChain } from '../../entry-types.js'

type CreateSuccessRecord = {
    creator: string
    creation_time: string
    duration: string
    block_number: number
    message: string
    shares: string
    name: string
    token: {
        address: string
    }
    total: string
    txid: string
    is_random: boolean
    id: string
}

type NFTRedpacketRecord = {
    txid: string
    shares: number
    token_ids: string[]
    token_contract: {
        address: string
    }
    duration: number
    creation_time: number
    creator: {
        address: string
    }
    name: string
    message: string
    id: string
}

export class TheGraphRedPacket {
    static async getHistories(chainId: ChainId, senderAddress: string, contractAddress: string) {
        if (!senderAddress || !contractAddress) return

        const response = await fetchJSON<{
            data: {
                redPackets: CreateSuccessRecord[]
            }
        }>(REDPACKET_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    redPackets(where: { creator_address: "${senderAddress}" }) {
                          creator {
                              address
                          }
                          message
                          block_number,
                          creation_time,
                          duration,
                          shares,
                          name,
                          token {
                              address
                          },
                          total,
                          txid,
                          is_random
                          id,
                      }
                  }`,
            }),
        })

        if (!response.data.redPackets.length) return
        return response.data.redPackets.map(
            (x) =>
                ({
                    contract_address: contractAddress,
                    txid: x.txid,
                    id: x.id,
                    chainId,
                    shares: Number(x.shares),
                    total: x.total,
                    duration: Number(x.duration) * 1000,
                    block_number: Number(x.block_number),
                    contract_version: 4,
                    network: EVMChainResolver.networkType(chainId),
                    token_address: x.token.address,
                    sender: {
                        address: senderAddress,
                        name: x.name,
                        message: x.message,
                    },
                    rpid: '',
                    creation_time: Number(x.creation_time),
                    total_remaining: '',
                    password: '',
                    is_random: x.is_random,
                }) as RedPacketJSONPayloadFromChain,
        )
    }

    static async getNFTHistories(chainId: ChainId, senderAddress: string, contractAddress: string) {
        if (!senderAddress || !contractAddress) return

        const response = await fetchJSON<{
            data: {
                nftredPackets: NFTRedpacketRecord[]
            }
        }>(NFT_REDPACKET_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    nftredPackets(where: { creator_address: "${senderAddress}" }) {
                        id
                        txid
                        shares
                        token_ids
                        token_contract {
                            address
                        }
                        duration
                        creation_time
                        creator {
                            address
                        }
                        name
                        message
                        id
                    }
                }`,
            }),
        })

        if (!response.data.nftredPackets.length) return
        return response.data.nftredPackets.map(
            (x) =>
                ({
                    id: x.id,
                    chainId,
                    contract_address: contractAddress,
                    txid: x.txid,
                    contract_version: 1,
                    shares: x.shares,
                    network: EVMChainResolver.networkType(chainId),
                    token_address: x.token_contract.address,
                    sender: {
                        address: x.creator.address,
                        name: x.name,
                        message: x.message,
                    },
                    duration: x.duration * 1000,
                    token_ids: x.token_ids,
                    // #region Retrieve at NFT History List Item.
                    rpid: '',
                    creation_time: 0,
                    // #endregion
                    // #region Retrieve from database
                    password: '',
                    // #endregion
                }) as NftRedPacketJSONPayload,
        )
    }
}
