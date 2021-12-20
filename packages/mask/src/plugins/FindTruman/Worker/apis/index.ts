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
    DecryptedClue,
} from '../../types'
import urlcat from 'urlcat'

const FIND_TRUMAN_API_PREFIX = 'https://findtruman.io/api'

function request<T>(url: string, options: any, params?: any): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
        try {
            const response = await fetch(url, {
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
                resolve(data)
            } else {
                reject({ code, msg, data })
            }
        } catch (error) {
            reject(-1)
        }
    })
}

export function fetchConst(lang: string): Promise<FindTrumanConst> {
    return request<FindTrumanConst>(urlcat(FIND_TRUMAN_API_PREFIX, '/consts', { lang }), {
        method: 'GET',
    })
}

export function fetchStoryInfo(storyId: string): Promise<StoryInfo> {
    return request<StoryInfo>(urlcat(FIND_TRUMAN_API_PREFIX, '/stories/:storyId', { storyId }), {
        method: 'GET',
    })
}

export function fetchUserStoryStatus(storyId: string, address: string): Promise<UserStoryStatus> {
    return request<UserStoryStatus>(
        urlcat(FIND_TRUMAN_API_PREFIX, '/stories/:storyId/status', { storyId, uaddr: address }),
        {
            method: 'GET',
        },
    )
}

export function fetchUserPuzzleStatus(puzzleId: string, address: string): Promise<UserPuzzleStatus> {
    return request<UserPuzzleStatus>(
        urlcat(FIND_TRUMAN_API_PREFIX, '/puzzles/:puzzleId/status', { puzzleId, uaddr: address }),
        {
            method: 'GET',
        },
    )
}

export function fetchUserPollStatus(pollId: string, address: string): Promise<UserPollStatus> {
    return request<UserPollStatus>(
        urlcat(FIND_TRUMAN_API_PREFIX, '/polls/:pollId/status', { pollId, uaddr: address }),
        {
            method: 'GET',
        },
    )
}

export function fetchPuzzleResult(puzzleId: string): Promise<PuzzleResult> {
    return request<PuzzleResult>(urlcat(FIND_TRUMAN_API_PREFIX, '/puzzles/:puzzleId/result', { puzzleId }), {
        method: 'GET',
    })
}

export function fetchPollResult(pollId: string): Promise<PollResult> {
    return request<PollResult>(urlcat(FIND_TRUMAN_API_PREFIX, '/polls/:pollId/result', { pollId }), {
        method: 'GET',
    })
}

export function submitPuzzle(address: string, param: SubmitPuzzleParams): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
            const res = await request<string>(
                urlcat(FIND_TRUMAN_API_PREFIX, '/puzzles/submit'),
                {
                    method: 'POST',
                },
                {
                    data: param,
                    sig,
                },
            )
            resolve(res)
        } catch (error) {
            reject(error)
        }
    })
}

export function submitPoll(address: string, param: SubmitPollParams): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
            const res = await request<string>(
                urlcat(FIND_TRUMAN_API_PREFIX, '/polls/submit'),
                {
                    method: 'POST',
                },
                {
                    data: param,
                    sig,
                },
            )
            resolve(res)
        } catch (error) {
            reject(error)
        }
    })
}

export function fetchUserParticipatedStoryStatus(address: string): Promise<UserStoryStatus[]> {
    return request<UserStoryStatus[]>(
        urlcat(FIND_TRUMAN_API_PREFIX, '/participated_story_status', { uaddr: address }),
        {
            method: 'GET',
        },
    )
}

export function fetchClue(clueId: string, address: string): Promise<DecryptedClue> {
    return request<DecryptedClue>(urlcat(FIND_TRUMAN_API_PREFIX, '/clues/:clueId', { clueId, uaddr: address }), {
        method: 'GET',
    }).catch((error) => {
        throw new Error(error.code)
    })
}
