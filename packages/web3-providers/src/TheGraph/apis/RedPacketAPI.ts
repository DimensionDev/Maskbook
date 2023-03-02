import { type ChainId, chainResolver } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../../entry-helpers.js'
import { REDPACKET_API_URL, NFT_REDPACKET_API_URL } from '../constants.js'

type CreateSuccessRecord = {
    creator: string
    blockTimestamp: string
    creation_time: string
    duration: string
    blockNumber: string
    id: string
    message: string
    number: string
    name: string
    token_address: string
    total: string
    transactionHash: string
    ifrandom: boolean
}

type NFTRedpacketRecord = {
    id: string
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
}

export class TheGraphRedPacketAPI {
    async getHistories(chainId: ChainId, senderAddress: string, contractAddress: string) {
        if (!senderAddress || !contractAddress) return

        const response = await fetchJSON<{
            data: {
                creationSuccesses: CreateSuccessRecord[]
            }
        }>(REDPACKET_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    creationSuccesses(where: { creator: "${senderAddress}" }) {
                        creator
                        message
                        id
                        blockNumber,
                        blockTimestamp,
                        creation_time,
                        duration,
                        number,
                        name,
                        token_address,
                        total,
                        transactionHash,
                        ifrandom
                      }
                  }`,
            }),
        })

        if (!response?.data?.creationSuccesses?.length) return
        return response.data.creationSuccesses.map((x) => ({
            contract_address: contractAddress,
            txid: x.transactionHash,
            chainId,
            shares: Number(x.number),
            total: x.total,
            duration: Number(x.duration) * 1000,
            block_number: Number(x.blockNumber),
            contract_version: 4,
            networkType: chainResolver.networkType(chainId),
            token_address: x.token_address,
            sender: {
                address: senderAddress,
                name: x.name,
                message: x.message,
            },
            rpid: '',
            creation_time: Number(x.creation_time),
            total_remaining: '',
            password: '',
            is_random: x.ifrandom,
        }))
    }

    async getNFTHistories(chainId: ChainId, senderAddress: string, contractAddress: string) {
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
                    }
                }`,
            }),
        })

        if (!response?.data?.nftredPackets?.length) return
        return response.data.nftredPackets.map((x) => ({
            chainId,

            contract_address: contractAddress,
            txid: x.txid,
            contract_version: 1,
            shares: x.shares,
            network: chainResolver.networkType(chainId),
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
        }))
    }
}
