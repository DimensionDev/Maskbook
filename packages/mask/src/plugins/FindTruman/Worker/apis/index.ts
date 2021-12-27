import urlcat from 'urlcat'
import Services from '../../../../extension/service'
import {
    DecryptedClue,
    FindTrumanConst,
    FindTrumanRemoteError,
    PollResult,
    PuzzleResult,
    StoryInfo,
    SubmitPollParams,
    SubmitPuzzleParams,
    UserPollStatus,
    UserPuzzleStatus,
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
    return request<UserPuzzleStatus>(urlcat('/puzzles/:puzzleId/status', { puzzleId, uaddr }))
}

export function fetchUserPollStatus(pollId: string, uaddr: string) {
    return request<UserPollStatus>(urlcat('/polls/:pollId/status', { pollId, uaddr }))
}

export function fetchPuzzleResult(puzzleId: string) {
    return request<PuzzleResult>(urlcat('/puzzles/:puzzleId/result', { puzzleId }))
}

export function fetchPollResult(pollId: string) {
    return request<PollResult>(urlcat('/polls/:pollId/result', { pollId }))
}

export async function submitPuzzle(address: string, data: SubmitPuzzleParams) {
    const sig = await Services.Ethereum.personalSign(JSON.stringify(data), address)
    return request<string>('/puzzles/submit', {
        method: 'POST',
        body: JSON.stringify({ data, sig }),
    })
}

export async function submitPoll(address: string, data: SubmitPollParams) {
    const sig = await Services.Ethereum.personalSign(JSON.stringify(data), address)
    return request<string>('/polls/submit', {
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
