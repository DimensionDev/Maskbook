import urlcat from 'urlcat'
import Services from '../../../../extension/service'
import type {
    PollResult,
    PuzzleResult,
    SubmitPollParams,
    UserPuzzleStatus,
    UserStoryStatus,
    SubmitPuzzleParams,
    UserPollStatus,
    StoryInfo,
    FindTrumanConst,
} from '../../types'

const FIND_TRUMAN_API_PREFIX = 'https://findtruman.io/api'

async function request<T>(url: string, options?: RequestInit, params?: unknown): Promise<T> {
    const response = await fetch(urlcat(FIND_TRUMAN_API_PREFIX, url), {
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        ...options,
        body: params ? JSON.stringify(params) : null,
    })
    const { data, code, msg } = await response.json()
    if (code === 0) {
        return data
    }
    throw { code, msg, data }
}

export function fetchConst(lang: string) {
    const requestPath = urlcat('/consts', { l: lang })
    return request<FindTrumanConst>(requestPath, { method: 'GET' })
}

export function fetchStoryInfo(storyId: string) {
    const requestPath = urlcat('/stories/:storyId', { storyId })
    return request<StoryInfo>(requestPath, { method: 'GET' })
}

export function fetchUserStoryStatus(storyId: string, address: string) {
    const requestPath = urlcat('/stories/:storyId/status', { storyId, uaddr: address })
    return request<UserStoryStatus>(requestPath, { method: 'GET' })
}

export function fetchUserPuzzleStatus(puzzleId: string, address: string) {
    const requestPath = urlcat('/puzzles/:puzzleId/status', { puzzleId, uaddr: address })
    return request<UserPuzzleStatus>(requestPath, { method: 'GET' })
}

export function fetchUserPollStatus(pollId: string, address: string) {
    const requestPath = urlcat('/polls/:pollId/status', { pollId, uaddr: address })
    return request<UserPollStatus>(requestPath, { method: 'GET' })
}

export function fetchPuzzleResult(puzzleId: string) {
    const requestPath = urlcat('/puzzles/:puzzleId/result', { puzzleId })
    return request<PuzzleResult>(requestPath, { method: 'GET' })
}

export function fetchPollResult(pollId: string): Promise<PollResult> {
    const requestPath = urlcat('/polls/:pollId/result', { pollId })
    return request<PollResult>(requestPath, { method: 'GET' })
}

export async function submitPuzzle(address: string, param: SubmitPuzzleParams): Promise<string> {
    const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
    return request<string>('/puzzles/submit', { method: 'POST' }, { data: param, sig })
}

export async function submitPoll(address: string, param: SubmitPollParams): Promise<string> {
    const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
    return request<string>(`/polls/submit`, { method: 'POST' }, { data: param, sig })
}

export function fetchUserParticipatedStoryStatus(address: string): Promise<UserStoryStatus[]> {
    const requestPath = urlcat('/participated_story_status', { uaddr: address })
    return request<UserStoryStatus[]>(requestPath, { method: 'GET' })
}

export function fetchSecretKey(cid: string, address: string): Promise<{ key: string; iv: string }> {
    const requestPath = urlcat('/clue_key', { cid, uaddr: address })
    return request<{ key: string; iv: string }>(requestPath, { method: 'GET' })
}
