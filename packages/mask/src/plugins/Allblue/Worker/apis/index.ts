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
    AllblueConsts,
} from '../../types'

const ALLBLUE_API_PREFIX = 'https://findtruman.io/api'

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
        } catch (e) {
            reject(-1)
        }
    })
}

export function fetchConsts(lang: string): Promise<AllblueConsts> {
    return request<AllblueConsts>(`${ALLBLUE_API_PREFIX}/consts?l=${lang}`, {
        method: 'GET',
    })
}

export function fetchStoryInfo(storyId: string): Promise<StoryInfo> {
    return request<StoryInfo>(`${ALLBLUE_API_PREFIX}/stories/${storyId}`, {
        method: 'GET',
    })
}

export function fetchUserStoryStatus(storyId: string, address: string): Promise<UserStoryStatus> {
    return request<UserStoryStatus>(`${ALLBLUE_API_PREFIX}/stories/${storyId}/status?uaddr=${address}`, {
        method: 'GET',
    })
}

// export function fetchUserStageStatus(stageId: string, address: string): Promise<UserStageStatus> {
//     return request<UserStageStatus>(`${ALLBLUE_API_PREFIX}/stages/${stageId}/status?uaddr=${address}`, {
//         method: 'GET',
//     })
// }

export function fetchUserPuzzleStatus(puzzleId: string, address: string): Promise<UserPuzzleStatus> {
    return request<UserPuzzleStatus>(`${ALLBLUE_API_PREFIX}/puzzles/${puzzleId}/status?uaddr=${address}`, {
        method: 'GET',
    })
}

export function fetchUserPollStatus(pollId: string, address: string): Promise<UserPollStatus> {
    return request<UserPollStatus>(`${ALLBLUE_API_PREFIX}/polls/${pollId}/status?uaddr=${address}`, {
        method: 'GET',
    })
}

export function fetchPuzzleResult(puzzleId: string): Promise<PuzzleResult> {
    return request<PuzzleResult>(`${ALLBLUE_API_PREFIX}/puzzles/${puzzleId}/result`, {
        method: 'GET',
    })
}

export function fetchPollResult(pollId: string): Promise<PollResult> {
    return request<PollResult>(`${ALLBLUE_API_PREFIX}/polls/${pollId}/result`, {
        method: 'GET',
    })
}

export function submitPuzzle(address: string, param: SubmitPuzzleParams): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
            const res = await request<string>(
                `${ALLBLUE_API_PREFIX}/puzzles/submit`,
                {
                    method: 'POST',
                },
                {
                    data: param,
                    sig,
                },
            )
            resolve(res)
        } catch (e) {
            reject(e)
        }
    })
}

export function submitPoll(address: string, param: SubmitPollParams): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const sig = await Services.Ethereum.personalSign(JSON.stringify(param), address)
            const res = await request<string>(
                `${ALLBLUE_API_PREFIX}/polls/submit`,
                {
                    method: 'POST',
                },
                {
                    data: param,
                    sig,
                },
            )
            resolve(res)
        } catch (e) {
            reject(e)
        }
    })
}

export function fetchUserParticipatedStoryStatus(address: string): Promise<UserStoryStatus[]> {
    return request<UserStoryStatus[]>(`${ALLBLUE_API_PREFIX}/participated_story_status?uaddr=${address}`, {
        method: 'GET',
    })
}

export function fetchSecretKey(cid: string, address: string): Promise<{ key: string; iv: string }> {
    return request<{ key: string; iv: string }>(`${ALLBLUE_API_PREFIX}/clue_key?cid=${cid}&uaddr=${address}`, {
        method: 'GET',
    })
}
