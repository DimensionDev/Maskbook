import type snapshot from '@snapshot-labs/snapshot.js'

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

export interface Proposal {
    address: string
    msg: string
    sig: string
    version: string
    isStart: boolean
    isEnd: boolean
    status: string
    authorName: string | null
    authorAvatar: string | null
    network: string
}

/**
 * Strategy is the way to calculate voting power.
 * https://docs.snapshot.org/strategies
 */
export interface Strategy {
    name: keyof typeof snapshot.strategies
    params: {
        address: string
        decimals?: number
        symbol: string
    }
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
    choice: string
    address: string
    authorIpfsHash: string
    relayerIpfsHash: string
    /** the voting power of one voter */
    balance: number
    /** the consist detail of voting power */
    scores: number[]
    strategySymbol: string
    sig: string
    authorName: string | null
    authorAvatar: string | null
    msg: {
        payload: {
            choice: number
            metadata: {}
            proposal: string
        }
        space: string
        timestamp: string
        type: 'vote'
        version: string
    }
}

export type VoteItemList = {
    [key in string]: VoteItem
}

export interface ProposalResult {
    choice: string
    voteNumber: number
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
