import { FoundationAddressIdQuery } from '../queries/'
import { ChainId } from '@masknet/web3-shared'

export async function querySubgaphs(tokenId: string, chainId: ChainId) {
    const url =
        chainId === ChainId.Mainnet
            ? 'https://api.thegraph.com/subgraphs/name/f8n/fnd'
            : 'https://api.thegraph.com/subgraphs/name/f8n/fnd-goerli'
    const fetchResponse = await (
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: FoundationAddressIdQuery(tokenId) }),
            mode: 'cors',
        })
    ).json()
    return fetchResponse
}

export async function getMetadata(url: string) {
    const fetchResponse = await (
        await fetch(`https://ipfs.io/ipfs/${url}/metadata.json`, {
            method: 'GET',
            mode: 'cors',
        })
    ).json()
    return fetchResponse
}

// export async function fetchApi(link: string, chainId: ChainId) {
//     const tokenId = getTokenId(link)
//     const graph: GraphData = await querySubgaphs(tokenId[tokenId.length - 1], chainId)
//     const metadata: Metadata = await getMetadata(graph.data.nfts[0].tokenIPFSPath.split('/')[0])
//     return { graph, metadata }
// }
