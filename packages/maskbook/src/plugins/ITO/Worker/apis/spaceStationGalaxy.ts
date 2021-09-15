import { ChainId, getSpaceStationGalaxyConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { EthereumAddress } from 'wallet.ts'
import type { ClaimableCount, CampaignInfo, ClaimParams } from '../../types'

export const CAMPAIGN_ID = 160
const WHITE_LIST_INFO_FIELD = `
    maxCount
    usedCount
`

async function fetchFromSubgraph<T>(query: string) {
    const subgraphURL = getSpaceStationGalaxyConstants(ChainId.Matic)?.SUBGRAPH_URL
    if (!subgraphURL) return null
    const response = await fetch(subgraphURL, {
        method: 'POST',
        body: stringify({ query }),
        headers: {
            'content-type': 'application/json',
        },
    })

    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function getClaimableTokenCount(address: string, id: number): Promise<ClaimableCount> {
    const data = await fetchFromSubgraph<{
        campaign: {
            whitelistInfo: ClaimableCount
        }
    }>(`
    {
        campaign(id: ${id}) {
            whitelistInfo(address: "${address.toLowerCase()}") {
                ${WHITE_LIST_INFO_FIELD}
            }
        }
    }
    `)
    if (!data || !EthereumAddress.isValid(address)) return { maxCount: -1, usedCount: 0 }

    const {
        campaign: { whitelistInfo },
    } = data

    return whitelistInfo
}

export async function getCampaignInfo(id: number): Promise<CampaignInfo> {
    const data = await fetchFromSubgraph<{
        campaign: {
            name: string
            description: string
            chain: string
            endTime: number
            startTime: number
            gamification: {
                nfts: { nft: { image: string } }[]
            }
        }
    }>(`
    {
        campaign(id: ${id}) {
            chain
            name
            endTime
            startTime
            description
            gamification {
                nfts {
                  nft {
                    image
                  }
                }
              }
        }
    }
    `)

    if (!data) throw new Error('Failed to load payload.')

    const {
        campaign: {
            chain,
            name,
            description,
            endTime,
            startTime,
            gamification: { nfts },
        },
    } = data

    return {
        id,
        chain,
        name,
        description,
        endTime,
        startTime,
        nfts: nfts.map((v) => v.nft),
    }
}

// (Matic) Mask Social Defi Alliance
// https://bulletlabs.notion.site/Matic-Mask-Social-Defi-Alliance-f798356212604dc7b3c6f8fbf066de21
export async function getAccountClaimSignature(
    userSignature: string,
    account: string,
    chain: string,
    id: number,
): Promise<ClaimParams> {
    const data = await fetchFromSubgraph<{
        prepareParticipate: {
            allow: boolean
            signature: string
            mintFuncInfo: {
                verifyIDs: number[]
                nftCoreAddress: string
                powahs: number[]
            }
        }
    }>(`
      mutation {
        prepareParticipate(input: {
            signature:"${userSignature}",
            campaignID: ${id},
            address: "${account}",
            mintCount: 1,
            chain: ${chain}
        }){
            allow
            signature
            mintFuncInfo {
                nftCoreAddress
                verifyIDs
                powahs
            }
        }
      }
    `)

    if (!data?.prepareParticipate.mintFuncInfo)
        return { allow: false, signature: '', verifyIDs: [], nftCoreAddress: '', powahs: [] }

    const {
        prepareParticipate: {
            allow,
            signature,
            mintFuncInfo: { verifyIDs, nftCoreAddress, powahs },
        },
    } = data

    return { allow, signature, verifyIDs, nftCoreAddress, powahs }
}

export async function mutationParticipate(
    userSignature: string,
    account: string,
    chain: string,
    id: number,
    txHash: string,
    verifyIDs: number[],
) {
    const data = await fetchFromSubgraph<{ participate: { participated: boolean } }>(`
    mutation {
        participate(input: {
            signature:"${userSignature}",
            campaignID: ${id},
            address: "${account}",
            tx: "${txHash}",
            verifyIDs: ${verifyIDs},
            chain: ${chain}
        }){
            participated
        }
    }
    `)

    if (!data) throw new Error('Failed to load payload.')

    return data.participate.participated
}
