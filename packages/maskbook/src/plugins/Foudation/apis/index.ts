import { FoundationAddressIdQuery } from '../queries/'
import type { GraphData, Metadata } from '../types'

function getTokenId(foudationUrl: string) {
    if (foudationUrl.includes('/~/')) {
        return foudationUrl.split('/')
    }
    return foudationUrl.split('-')
}
export async function fetchApi(foudationUrl: string, subgraphsUrl: string | undefined) {
    if (!subgraphsUrl) return null
    const tokenId = getTokenId(foudationUrl)
    const subgraphResponse: GraphData = await (
        await fetch(subgraphsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: FoundationAddressIdQuery(tokenId[tokenId.length - 1]) }),
            mode: 'cors',
        })
    ).json()
    const metadataResponse: Metadata = await (
        await fetch(`https://ipfs.io/ipfs/${subgraphResponse.data.nfts[0].tokenIPFSPath.split('/')[0]}/metadata.json`, {
            method: 'GET',
            mode: 'cors',
        })
    ).json()
    return { subgraphResponse, metadataResponse }
}
