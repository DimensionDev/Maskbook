export enum PostType {
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
    type: string
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

export interface IconResource {
    icon: string
    label: string
    url: string
}

export interface FindTrumanConst {
    faqLabel: string
    faqDesc: string
    faqUrl: string
    icons: IconResource[]
    discoveryUrl: string
    discoveryLabel: string
    locales: Record<string, string>
    storyId: string
    ftgAddress: string
    getPoapUrl: string
    boxImg: string
    ftgImg: string
    poapImg: string
    ftgPartLogoImg: string
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
    critical: {
        total: number
        correct: number
        wrong: number
        waiting: number
    }
    nonCritical: {
        total: number
        correct: number
        wrong: number
        waiting: number
    }
}

export interface UserCount {
    choice: number
    value: number
}

export interface UserPollStatus {
    id: string
    story: StoryInfo
    status: number // 1: opening, 0: finished
    question: string
    options: string[]
    count?: UserCount[]
    choice: number
    conditions: PuzzleCondition[]
    notMeetConditions: PuzzleCondition[]
    critical: boolean
}

export interface UserPollOrPuzzleStatus extends UserPollStatus {
    type: PostType.Poll | PostType.Puzzle
    result: number
}

export interface PuzzleResult {
    id: string
    question: string
    story: StoryInfo
    options: string[]
    correct: number
    count: UserCount[]
}

export interface PollResult {
    id: string
    question: string
    story: StoryInfo
    options: string[]
    result: number
    count: UserCount[]
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

export enum ClueConditionType {
    And = 'and',
    Or = 'or',
    Erc721 = 'hold-erc721',
    Erc20 = 'hold-erc20',
}

export interface ClueCondition {
    type: ClueConditionType
    chain: string
    chainId: number
    address: string
    minAmount: number
    name: string
    img: string
    url: string
    conditions?: ClueCondition[]
}

export interface DecryptedClue {
    decrypted: boolean
    conditions?: ClueCondition
    frontImg: string
    backImg: string
}

export interface PoapInfo {
    id: number
    img: string
    name: string
}

export interface MysteryBox {
    id: number
    owner: string
    giver: string
    givenTime: string
    isOpened: boolean
    openTime: string
    partType: PartType
    partKind: number
    mintTaskId: number
    isMinted: boolean
    mintTime: string
    nftId: number
    img: string
}

export interface Quest {
    id: number
    title: string
    desc: string
    startFrom: string
    endTo: string
}

export enum PartType {
    Head = 1,
    Skin = 2,
    Clothes = 3,
    Mask = 4,
    Background = 5,
}

export interface Part {
    tokenId: number
    type: PartType
    kind: number
    name: string
    img: string
    used: boolean
}

export interface UserPartsInfo {
    boxes: MysteryBox[]
    quests: Quest[]
    parts: Part[]
}

export interface FtgInfo {
    name: string
    image: string
    description: string
    tokenId: string
}

export interface ExchangeStatus {
    parts?: Part[]
    status: number
}

export interface OpenMysteryBoxParams {
    timestamp: number
    address: string
    rawdata: {
        boxId: number
    }
}

export class FindTrumanRemoteError extends Error {
    public readonly code: number
    public readonly data: unknown

    constructor(message: string, code: number, data?: unknown) {
        super(message)
        this.code = code
        this.data = data
    }
}
