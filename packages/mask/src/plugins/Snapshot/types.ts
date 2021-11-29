export interface ProposalIdentifier {
    /**
     * ENS domain name of space.
     * Space is a set of proposals by which specific entity can raise for its purpose.
     * https://docs.snapshot.org/spaces
     */
    space: string
    /** the identifier of proposal */
    id: string
}
export interface RawVote {
    /**
     * There're two sorts of vote,
     * for multiple choice vote, each choice can be assigned to a different weight.
     */
    choice: number | { [choiceIndex: number]: number } | number[]
    created: number
    voter: string
    id: string
}

export interface Proposal {
    address: string
    author: string
    msg: string
    title: string
    version: string
    end: number
    start: number
    snapshot: string
    body: string
    choices: string[]
    isStart: boolean
    isEnd: boolean
    status: string
    strategies: Strategy[]
    authorName: string | null
    authorAvatar: string | null
    network: string
    votes: RawVote[]
}

/**
 * Strategy is the way to calculate voting power.
 * https://docs.snapshot.org/strategies
 */
export interface Strategy {
    name: string
    params: {
        address: string
        decimals?: number
        symbol: string
    }
    __typename: string
}

export interface ProposalPayload {
    body: string
    choices: string[]
    start: number
    end: number
    snapshot: string
    name: string
    metadata: {
        strategies: Strategy[]
        network: string
    }
}

export interface ProposalMessage {
    payload: ProposalPayload
    timestamp: string
    token: string
    type: 'proposal'
    version: string
    space: string
}

/**
 * Payload of a vote
 */
export interface VoteItem {
    choice: string | undefined
    totalWeight: number | undefined
    choices:
        | {
              index: number
              weight: number
              name: string
          }[]
        | undefined
    address: string
    authorIpfsHash: string
    /** the voting power of one voter */
    balance: number
    /** the consist detail of voting power */
    scores: number[]
    strategySymbol: string
    authorName: string | null
    authorAvatar: string | null
    choiceIndex: number | undefined
    choiceIndexes: number[] | undefined
    timestamp: number
}

export type VoteItemList = {
    [key in string]: VoteItem
}

export interface ProposalResult {
    choice: string
    powerDetail: {
        power: number
        name: string
    }[]
    power: number
    percentage: number
}

/**
 * Off-chain solution to bind personal information e.g. avatar name with EOA.
 * https://3boxlabs.com/
 */
export interface Profile3Box {
    contract_address: string
    image: string | null
    name: string | null
}

/**
 * Full-filled response of voting request.
 */
export interface VoteSuccess {
    ipfsHash: string
}
