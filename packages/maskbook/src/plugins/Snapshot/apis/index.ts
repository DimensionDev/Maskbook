import ss from '@snapshot-labs/snapshot.js'
import type { Votes, Proposal } from '../types'

export async function fetchProposal(id: string) {
    const response = await fetch(`https://ipfs.io/ipfs/${id}`, {
        method: 'GET',
    })
    return (await response.json()) as Proposal
}

export function fetchAllProposalsOfSpace() {}

export async function fetchAllVotesOfProposal(id: string, space: string) {
    const response = await fetch(`https://hub.snapshot.page/api/${space}/proposal/${id}`, {
        method: 'GET',
    })
    const result: Votes = await response.json()
    return result
}

export async function fetch3BoxProfiles(addresses: string[]) {
    return ss.utils.subgraphRequest('https://api.3box.io/graph', {
        profiles: {
            __args: {
                ids: addresses,
            },
            name: true,
            eth_address: true,
            image: true,
        },
    })
}
