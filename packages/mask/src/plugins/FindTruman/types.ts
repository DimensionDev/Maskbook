export enum FindTrumanPostType {
    Status = 'result',
    Puzzle = 'puzzle',
    Poll = 'poll',
    PuzzleResult = 'puzzle_result',
    PollResult = 'poll_result',
    Encryption = 'encryption',
}

export type FindTrumanI18nFunction = (id: string, options?: { [key: string]: string | number }) => string

export interface ProposalIdentifier {
    address: string
    const?: FindTrumanConst
    t: FindTrumanI18nFunction
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

export interface FindTrumanConst {
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
    locales: { [id: string]: string }
    t: FindTrumanI18nFunction
}

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
    notMeetConditions: PuzzleCondition[]
    critical: boolean
}

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
    notMeetConditions: PuzzleCondition[]
    critical: boolean
}

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

export interface SubmitPuzzleParams {
    target: string
    from: string
    timestamp: number // in seconds
    choice: number
}

export interface SubmitPollParams {
    target: string
    from: string
    timestamp: number // in seconds
    choice: number
}

export interface DecryptedClue {
    decrypted: boolean
    condition?: PuzzleCondition
    content?: string
}
