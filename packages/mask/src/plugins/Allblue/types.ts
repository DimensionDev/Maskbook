export enum AllbluePostType {
    Status = 'result',
    Puzzle = 'puzzle',
    Poll = 'poll',
    PuzzleResult = 'puzzle_result',
    PollResult = 'poll_result',
    Encryption = 'encryption'
}

export interface ProposalIdentifier {
    address: string
    consts?: AllblueConsts
}

export interface Stage {
    id: string
}

export interface PuzzleCondition {
    type: 'hold-erc721' | 'hold-erc1155'
    chain: string
    chainId: number
    address: string
    nftType: 'erc721' | 'erc1155'
    tokenId?: string
    minAmount: number
    name: string
    img: string
    url: string
}

export interface PollHistory {
    poll: string
    result: string
}

export interface StoryInfo {
    id: string
    name: string
    img: string
}

export interface AllblueConsts {
    faqLabel: string
    faqDesc: string
    faqUrl: string
    icons: {
        icon: string
        label: string
        url: string
    }[]
    discoveryUrl: string
    discoveryLabel: string
}

/**
 * GET /stories/1/status?uaddr
 */
export interface UserStoryStatus {
    id: string
    name: string
    img: string
    puzzles: {
        total: number
        solved: number
        failed: number
        waiting: number
    }
    polls: {
        total: number
        hit: number
        failed: number
        waiting: number
    }
}

/**
 * GET /puzzles/1/status?uaddr
 */
export interface UserPuzzleStatus {
    id: string
    story: StoryInfo
    status: number // 1: opening, 0: finished
    question: string
    options: string[]
    count?: {
        choice: number
        value: number
    }[]
    choice: number
    conditions: PuzzleCondition[]
}

/**
 * GET /polls/1/status?uaddr
 */
export interface UserPollStatus {
    id: string
    story: StoryInfo
    history: PollHistory[]
    status: number // 1: opening, 0: finished
    question: string
    options: string[]
    count?: {
        choice: number
        value: number
    }[]
    choice: number
    conditions: PuzzleCondition[]
}

/**
 * GET /puzzles/1/result
 */
export interface PuzzleResult {
    id: string
    question: string
    story: StoryInfo
    options: string[]
    correct: number
    count: {
        choice: number
        value: number
    }[]
}

/**
 * GET /polls/1/result
 */
export interface PollResult {
    id: string
    question: string
    history: PollHistory[]
    story: StoryInfo
    options: string[]
    result: number
    count: {
        choice: number
        value: number
    }[]
}

/**
 * POST /puzzles/submit
 */
export interface SubmitPuzzleParams {
    target: string
    from: string
    timestamp: number // in seconds
    choice: number
}

/**
 * POST /polls/submit
 */
export interface SubmitPollParams {
    target: string
    from: string
    timestamp: number // in seconds
    choice: number
}
