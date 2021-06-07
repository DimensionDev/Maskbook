import ss from '@snapshot-labs/snapshot.js'
import { ChainId } from '@dimensiondev/web3-shared'
import type { VoteItemList, Proposal, Profile3Box, ProposalMessage, ProposalIdentifier, VoteSuccess } from '../types'
import Services from '../../../extension/service'

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
    const result: VoteItemList = await response.json()
    return result
}

export async function fetch3BoxProfiles(addresses: string[]): Promise<Profile3Box[]> {
    const { profiles } = await ss.utils.subgraphRequest('https://api.3box.io/graph', {
        profiles: {
            __args: {
                ids: addresses,
            },
            name: true,
            eth_address: true,
            image: true,
        },
    })

    return profiles ?? []
}

export async function getScores(message: ProposalMessage, voters: string[], blockNumber: number) {
    const spaceKey = message.space
    const strategies = message.payload.metadata.strategies
    const network = ChainId.Mainnet.toString()
    const provider = ss.utils.getProvider(network)
    const snapshot = Number(message.payload.snapshot)
    const blockTag = snapshot > blockNumber ? 'latest' : snapshot
    const scores: { [key in string]: number }[] = await ss.utils.getScores(
        spaceKey,
        strategies,
        network,
        provider,
        voters,
        blockTag,
    )
    return scores
}

export async function vote(identifier: ProposalIdentifier, choice: number, address: string) {
    const msg = JSON.stringify({
        version: '0.1.3',
        timestamp: (Date.now() / 1e3).toFixed(),
        space: identifier.space,
        type: 'vote',
        payload: {
            proposal: identifier.id,
            choice,
            metadata: {},
        },
    })

    const sig = await Services.Ethereum.personalSign(msg, address)

    const response = await fetch(`https://hub.snapshot.page/api/message`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg, sig, address }),
    })

    const result: VoteSuccess = await response.json()
    return result
}
