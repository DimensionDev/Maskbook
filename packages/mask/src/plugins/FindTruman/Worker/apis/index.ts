import { EVM_RPC } from '@masknet/plugin-evm/src/messages'
import urlcat from 'urlcat'
import {
    DecryptedClue,
    ExchangeStatus,
    FindTrumanConst,
    FindTrumanRemoteError,
    MysteryBox,
    OpenMysteryBoxParams,
    PoapInfo,
    PollResult,
    PuzzleResult,
    QuestionGroup,
    StoryInfo,
    SubmitCompletionParams,
    SubmitPollParams,
    SubmitPuzzleParams,
    UserCompletionStatus,
    UserPartsInfo,
    UserPollOrPuzzleStatus,
    UserPollStatus,
    UserStoryStatus,
} from '../../types'

const PREFIX = 'https://findtruman.io/api'

async function request<T>(url: string, options?: RequestInit) {
    const response = await fetch(urlcat(PREFIX, url), {
        mode: 'cors',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...options,
    })
    interface Payload {
        data: T
        code: number
        msg: string
    }
    const { data, code, msg }: Payload = await response.json()
    if (code !== 0) {
        throw new FindTrumanRemoteError(msg, code, data)
    }
    return data
}

export function fetchConst(lang: string) {
    return request<FindTrumanConst>(urlcat('/consts', { l: lang }))
}

export function fetchStoryInfo(storyId: string) {
    return request<StoryInfo>(urlcat('/stories/:storyId', { storyId }))
}

export function fetchUserStoryStatus(storyId: string, uaddr: string) {
    return request<UserStoryStatus>(urlcat('/stories/:storyId/status', { storyId, uaddr }))
}

export function fetchUserPuzzleStatus(puzzleId: string, uaddr: string) {
    return request<UserPollStatus>(urlcat('/puzzles/:puzzleId/status', { puzzleId, uaddr }))
}

export function fetchUserPollStatus(pollId: string, uaddr: string) {
    return request<UserPollStatus>(urlcat('/polls/:pollId/status', { pollId, uaddr }))
}

export function fetchUserCompletionStatus(quesId: string, uaddr: string) {
    return request<UserCompletionStatus>(urlcat('/subjective_questions/:quesId', { quesId, uaddr }))
}

export function fetchPuzzleResult(puzzleId: string) {
    return request<PuzzleResult>(urlcat('/puzzles/:puzzleId/result', { puzzleId }))
}

export function fetchPollResult(pollId: string) {
    return request<PollResult>(urlcat('/polls/:pollId/result', { pollId }))
}

export async function submitPuzzle(address: string, data: SubmitPuzzleParams) {
    const sig = await EVM_RPC.personalSign(JSON.stringify(data), address)
    return request<string>('/puzzles/submit', {
        method: 'POST',
        body: JSON.stringify({ data, sig }),
    })
}

export async function submitPoll(address: string, data: SubmitPollParams) {
    const sig = await EVM_RPC.personalSign(JSON.stringify(data), address)
    return request<string>('/polls/submit', {
        method: 'POST',
        body: JSON.stringify({ data, sig }),
    })
}

export async function submitCompletion(address: string, params: SubmitCompletionParams) {
    const { timestamp, quesId, answers } = params
    const data = {
        timestamp,
        address,
        rawdata: {
            quesId,
            answers,
        },
    }
    const sig = await EVM_RPC.personalSign(JSON.stringify(data), address)
    return request<string>('/subjective_questions/_/answer', {
        method: 'POST',
        body: JSON.stringify({ data, sig }),
    })
}

export function fetchUserParticipatedStoryStatus(uaddr: string) {
    return request<UserStoryStatus[]>(urlcat('/participated_story_status', { uaddr }))
}

export function fetchClue(clueId: string, uaddr: string) {
    return request<DecryptedClue>(urlcat('/clues/:clueId', { clueId, uaddr }))
}

export function fetchUserPoap(uaddr: string) {
    return request<PoapInfo[]>(urlcat('/ftpoap', { uaddr }))
}

export function fetchMysteryBoxInfo(id: number) {
    return request<MysteryBox>(urlcat('/mystery-boxes/:id', { id }))
}

export async function openMysteryBox(address: string, data: OpenMysteryBoxParams) {
    const sig = await EVM_RPC.personalSign(JSON.stringify(data), address)
    return request<MysteryBox>('/mystery-boxes/_/open', {
        method: 'POST',
        body: JSON.stringify({ data, sig }),
    })
}

export function fetchUserPartsInfo(uaddr: string) {
    return request<UserPartsInfo>(urlcat('/assets/parts_with_additional', { uaddr }))
}

export function fetchExchangeStatus(uaddr: string) {
    return request<ExchangeStatus>(urlcat('/assets/exchange_status', { uaddr }))
}

export function fetchAllPollsOrPuzzles(uaddr: string) {
    return request<UserPollOrPuzzleStatus[]>(urlcat('/polls_or_puzzles', { uaddr }))
}

export function fetchQuestions(uaddr: string) {
    return request<QuestionGroup>(urlcat('/questions', { uaddr }))
}

export function exchangeFtgWhitelist() {
    return request(urlcat('/assets/exchange_ftg_airdrop_whitelist', {}), {
        method: 'POST',
        body: JSON.stringify({}),
    })
}
