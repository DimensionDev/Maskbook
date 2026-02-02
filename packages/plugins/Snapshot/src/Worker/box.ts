import type { HubProposal, RawVote, Strategy } from '../types.js'

interface SpaceQueryResult {
    space: Space
}

interface Space {
    id: string
    _indexer: string
    controller: string
    authenticators: string[]
    metadata: SpaceMetadata
    voting_power_validation_strategies_parsed_metadata: StrategyParsedMetadata[]
    proposal_count: number
    vote_count: number
    created: number
}

interface SpaceMetadata {
    name: string
    avatar: string
    voting_power_symbol: string
    executors_strategies: ExecutorStrategy[]
}

interface ExecutorStrategy {
    id: string
    address: string
    destination_address: string
    type: string
    treasury_chain: string
    treasury: string
}

interface StrategyParsedMetadata {
    index: number
    data: StrategyData
}

interface StrategyData {
    id: string
    name: string
    description: string
    decimals: number
    symbol: string
    token: string
    payload: any
}

interface Proposal {
    id: string
    proposal_id: string
    space: {
        id: string
        metadata: SpaceMetadata
        strategies_parsed_metadata: StrategyParsedMetadata[]
    }
    author: {
        id: string
    }
    quorum: number
    execution_hash: string
    metadata: {
        id: string
        title: string
        body: string
        discussion: string
        execution: string
        choices: string[]
        labels: string[]
    }
    start: number
    max_end: number
    snapshot: number
    scores_1: string
    scores_2: string
    scores_3: string
    scores_total: number
    execution_strategy: string
    execution_strategy_type: string
    execution_destination: string
    strategies_indices: number[]
    strategies: string[]
    strategies_params: string[]
    created: number
    vote_count: number
}

interface ProposalQueryResult {
    proposal: Proposal
}

interface VotesQueryResponse {
    data: {
        votes: Vote[]
    }
}

interface Vote {
    id: string
    voter: {
        id: string
    }
    space: {
        id: string
    }
    metadata: {
        reason: string | null
    }
    proposal: number
    choice: number
    vp: string
    created: number
    tx: string
}

// Parse the space identifier to extract indexer and space address
// Format: "sn:0x07bd3419669f9f0cc8f19e9e2457089cdd4804a4c41a5729ee9c7fd02ab8ab62"
// Returns: { indexer: "sn", spaceAddress: "0x07bd..." }
function parseSpaceIdentifier(space: string): { indexer: string; spaceAddress: string } {
    const parts = space.split(':')
    if (parts.length > 1) {
        return { indexer: parts[0], spaceAddress: parts[1] }
    }
    // Default to "sn" indexer if no prefix
    return { indexer: 'sn', spaceAddress: space }
}

export async function fetchProposalFromBoxApi(id: string): Promise<HubProposal> {
    // Parse the ID to extract space and proposal ID
    // Format: "0x07bd3419669f9f0cc8f19e9e2457089cdd4804a4c41a5729ee9c7fd02ab8ab62/54"
    const [spaceId] = id.split('/')

    const { indexer, spaceAddress } = parseSpaceIdentifier(spaceId)

    const spaceData = await fetchSpaceFromBoxApi(indexer, spaceAddress)

    const proposalData = await fetchProposalDataFromBoxApi(id)

    // Merge space data into proposal
    // Use the original spaceId (with prefix if present) as the space identifier
    proposalData.space = {
        id: spaceId, // Preserve the original space identifier (e.g., "sn:0x07bd...")
        metadata: spaceData.metadata,
        strategies_parsed_metadata: spaceData.voting_power_validation_strategies_parsed_metadata,
    }

    // Return formatted proposal
    return formatBoxProposal(proposalData, spaceData)
}

async function fetchSpaceFromBoxApi(indexer: string, spaceAddress: string): Promise<Space> {
    const response = await fetch('https://api.snapshot.box/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Space',
            query: /* GraphQL */ `
                query Space($indexer: String!, $id: String!) {
                    space(indexer: $indexer, id: $id) {
                        id
                        _indexer
                        controller
                        authenticators
                        metadata {
                            name
                            avatar
                            voting_power_symbol
                            executors_strategies {
                                treasury_chain
                            }
                        }
                        voting_power_validation_strategies_parsed_metadata {
                            index
                            data {
                                id
                                name
                                description
                                decimals
                                symbol
                                token
                                payload
                            }
                        }
                        proposal_count
                        vote_count
                        created
                    }
                }
            `,
            variables: {
                indexer,
                id: spaceAddress,
            },
        }),
    })

    const res: { data: SpaceQueryResult } = await response.json()
    return res.data.space
}

async function fetchProposalDataFromBoxApi(proposalId: string): Promise<Proposal> {
    const response = await fetch('https://api.snapshot.box/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Proposal',
            query: /* GraphQL */ `
                query Proposal($id: String!) {
                    proposal(id: $id) {
                        id
                        proposal_id
                        space {
                            id
                            metadata {
                                name
                                avatar
                                voting_power_symbol
                                executors_strategies {
                                    id
                                    address
                                    destination_address
                                    type
                                    treasury_chain
                                    treasury
                                }
                            }
                            strategies_parsed_metadata {
                                index
                                data {
                                    id
                                    name
                                    description
                                    decimals
                                    symbol
                                    token
                                    payload
                                }
                            }
                        }
                        author {
                            id
                        }
                        quorum
                        execution_hash
                        metadata {
                            id
                            title
                            body
                            discussion
                            execution
                            choices
                            labels
                        }
                        start
                        max_end
                        snapshot
                        scores_1
                        scores_2
                        scores_3
                        scores_total
                        execution_strategy
                        execution_strategy_type
                        execution_destination
                        strategies_indices
                        strategies
                        strategies_params
                        created
                        vote_count
                    }
                }
            `,
            variables: {
                id: proposalId,
            },
        }),
    })

    const res: { data: ProposalQueryResult } = await response.json()
    return res.data.proposal
}

export function formatBoxProposal(proposal: Proposal, space: Space): HubProposal {
    // Map strategies from Box API format to Snapshot format
    const strategies: Strategy[] = space.voting_power_validation_strategies_parsed_metadata.map((sm) => ({
        name: sm.data.name,
        params: {
            address: sm.data.token,
            decimals: sm.data.decimals,
            symbol: sm.data.symbol,
        },
        network: '',
        __typename: 'Strategy',
    }))

    const network = space.metadata.executors_strategies?.[0]?.treasury_chain || ''

    // Compute state based on current time
    const now = Math.floor(Date.now() / 1000)
    const state =
        proposal.start > now ? 'pending'
        : proposal.max_end < now ? 'closed'
        : 'active'

    return {
        author: proposal.author.id,
        body: proposal.metadata.body,
        choices: proposal.metadata.choices,
        created: proposal.start, // Box API doesn't return created separately
        discussion: proposal.metadata.discussion,
        end: proposal.max_end,
        id: proposal.id,
        ipfs: '',
        network,
        privacy: 'shutter',
        scores: [],
        scores_by_strategy: [+proposal.scores_1, +proposal.scores_2, +proposal.scores_3],
        scores_total: proposal.scores_total,
        snapshot: proposal.snapshot.toString(),
        start: proposal.start,
        state,
        strategies,
        symbol: space.metadata.voting_power_symbol,
        title: proposal.metadata.title,
        type: 'single-choice',
        votes: proposal.vote_count,
        space: {
            id: space.id,
            name: space.metadata.name,
            symbol: space.metadata.voting_power_symbol,
            avatar: space.metadata.avatar,
        },
    }
}

export async function fetchVotesFromBox(id: string, first: number, skip: number, space: string) {
    const proposalId = id.includes('/') ? id.split('/').pop()! : id
    const response = await fetch('https://api.snapshot.box/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Votes',
            query: /* GraphQL */ `
                query Votes(
                    $first: Int!
                    $skip: Int!
                    $orderBy: Vote_orderBy!
                    $orderDirection: OrderDirection!
                    $where: Vote_filter
                ) {
                    votes(
                        first: $first
                        skip: $skip
                        where: $where
                        orderBy: $orderBy
                        orderDirection: $orderDirection
                    ) {
                        id
                        voter {
                            id
                        }
                        space {
                            id
                        }
                        metadata {
                            reason
                        }
                        proposal
                        choice
                        vp
                        created
                        tx
                    }
                }
            `,
            variables: {
                first,
                skip,
                orderBy: 'vp',
                orderDirection: 'desc',
                where: {
                    proposal: proposalId,
                    space,
                },
            },
        }),
    })

    const res: VotesQueryResponse = await response.json()
    return res.data
}

export function formatBoxVote(vote: Vote): RawVote {
    return {
        choice: vote.choice,
        created: vote.created,
        id: vote.id,
        ipfs: '',
        voter: vote.voter.id,
        vp: +vote.vp,
        vp_by_strategy: [],
    }
}
