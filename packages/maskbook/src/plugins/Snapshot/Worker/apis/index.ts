import ss from '@dimensiondev/snapshot.js'
import type {
    Proposal,
    Profile3Box,
    ProposalMessage,
    ProposalIdentifier,
    VoteSuccess,
    RawVote,
    Strategy,
} from '../../types'
import Services from '../../../../extension/service'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'
import { transform } from 'lodash-es'

export async function fetchProposal(id: string) {
    const response = await fetch(resolveIPFSLink(id), {
        method: 'GET',
    })
    const { network, votes, strategies } = await fetchProposalFromGraphql(id)
    const result = await response.json()
    return { ...result, network, strategies, votes } as Proposal
}

async function fetchProposalFromGraphql(id: string) {
    const response = await fetch(`https://hub.snapshot.org/graphql`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `query Proposal($id: String!) {
                proposal(id: $id) {
                    network
                    strategies {
                      name
                      params
                      __typename
                    }
                }
                votes(first: 10000, where: { proposal: $id }) {
                    id
                    voter
                    created
                    choice
                  }
            }`,
            variables: {
                id,
            },
        }),
    })
    interface Res {
        data: {
            proposal: {
                network: string
                strategies: Strategy[]
            }
            votes: RawVote[]
        }
    }

    const { data }: Res = await response.json()

    return { votes: data.votes, network: data.proposal.network, strategies: data.proposal.strategies }
}

export async function fetch3BoxProfiles(addresses: string[]): Promise<Profile3Box[]> {
    const { profiles } = await ss.utils.subgraphRequest('https://api.3box.io/graph', {
        profiles: {
            __args: {
                ids: addresses,
            },
            name: true,
            contract_address: true,
            image: true,
        },
    })

    return profiles ?? []
}

export async function getScores(
    message: ProposalMessage,
    voters: string[],
    blockNumber: number,
    _network: string,
    space: string,
    _strategies: Strategy[],
) {
    const strategies = _strategies ?? message.payload.metadata.strategies
    // Sometimes `message.payload.metadata.network` is absent, this is maybe a snapshot api issue.
    const network = message.payload.metadata.network ?? _network
    const provider = ss.utils.getProvider(network)
    const snapshot = Number(message.payload.snapshot)
    const blockTag = snapshot > blockNumber ? 'latest' : snapshot
    const scores: { [key in string]: number }[] = await ss.utils.getScores(
        space,
        strategies,
        network,
        provider,
        voters,
        blockTag,
    )
    return scores.map((score) =>
        transform(score, function (result: { [key in string]: number }, val, key: string) {
            result[key.toString().toLowerCase()] = val
        }),
    )
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
