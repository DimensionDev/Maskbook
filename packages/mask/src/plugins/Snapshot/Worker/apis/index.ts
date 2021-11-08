import ss from '@dimensiondev/snapshot.js'
import type { Proposal, Profile3Box, ProposalIdentifier, VoteSuccess, RawVote, Strategy } from '../../types'
import Services from '../../../../extension/service'
import { transform } from 'lodash-es'

export async function fetchProposal(id: string) {
    const { votes, proposal } = await fetchProposalFromGraphql(id)
    const now = Date.now()
    const isStart = proposal.start * 1000 < now
    const isEnd = proposal.end * 1000 < now
    return { ...proposal, address: proposal.author, isStart, isEnd, votes } as unknown as Proposal
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
                    id
                    ipfs
                    title
                    body
                    choices
                    start
                    end
                    snapshot
                    state
                    author
                    created
                    plugins
                    network
                    type
                    strategies {
                      name
                      params
                      __typename
                    }
                    space {
                      id
                      name
                    }
                }
                votes(first: 10000, where: { proposal: $id }) {
                    id
                    ipfs
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
                author: string
                body: string
                choices: string[]
                created: number
                end: number
                start: number
                id: string
                ipfs: string
                snapshot: string
                space: {
                    id: string
                    name: string
                }
                state: string
                title: string
                type: string
                network: string
                strategies: Strategy[]
            }
            votes: RawVote[]
        }
    }

    const { data }: Res = await response.json()
    return data
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
    snapshot: string,
    voters: string[],
    blockNumber: number,
    network: string,
    space: string,
    strategies: Strategy[],
) {
    const provider = ss.utils.getProvider(network)
    const blockTag = Number(snapshot) > blockNumber ? 'latest' : snapshot
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
