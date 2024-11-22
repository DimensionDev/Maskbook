import { type ChainId } from '@masknet/web3-shared-evm'
import { REDPACKET_API_URL } from '../constants.js'
import { EVMChainResolver } from '../../Web3/EVM/apis/ResolverAPI.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { RedPacketJSONPayloadFromChain } from '../../entry-types.js'

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
}
