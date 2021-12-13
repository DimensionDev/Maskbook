import { FindTrumanContext } from '../context'
import { LoadingFailCard } from './LoadingFailCard'
import { FindTruman } from './FindTruman'
import {
    FindTrumanConst,
    FindTrumanI18nFunction,
    FindTrumanPostType,
    PollResult,
    PuzzleResult,
    StoryInfo,
    UserPollStatus,
    UserPuzzleStatus,
    UserStoryStatus,
} from '../types'
import { useAccount } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
import {
    fetchConst,
    fetchPollResult,
    fetchPuzzleResult,
    fetchStoryInfo,
    fetchUserPollStatus,
    fetchUserPuzzleStatus,
    fetchUserStoryStatus,
    submitPoll,
    submitPuzzle,
} from '../Worker/apis'
import { FindTruman_Const } from '../constants'
import { useI18N } from '../../../utils'
import { FindTrumanI18n } from '../i18n'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const { url } = props
    const account = useAccount().toLowerCase()
    const { i18n } = useI18N()

    const [, , , _storyId, , _targetId] = new URL(url).hash.split('/')
    const storyId = _storyId ? _storyId : ''
    const targetId = _targetId ? _targetId : ''

    const postType: FindTrumanPostType = url.includes('/encryption?')
        ? FindTrumanPostType.Encryption
        : url.includes('/puzzles/')
        ? FindTrumanPostType.Puzzle
        : url.includes('/polls/')
        ? FindTrumanPostType.Poll
        : url.includes('/puzzle_result')
        ? FindTrumanPostType.PuzzleResult
        : url.includes('/poll_result/')
        ? FindTrumanPostType.PollResult
        : FindTrumanPostType.Status

    const [findTrumanI18n, setFindTrumanI18n] = useState<FindTrumanI18nFunction>(
        () => (key: string, options: any) => key,
    )
    const [storyInfo, setStoryInfo] = useState<StoryInfo>()
    const [userStoryStatus, setUserStoryStatus] = useState<UserStoryStatus>()
    const [userPuzzleStatus, setUserPuzzleStatus] = useState<UserPuzzleStatus>()
    const [userPollStatus, setUserPollStatus] = useState<UserPollStatus>()
    const [puzzleResult, setPuzzleResult] = useState<PuzzleResult>()
    const [pollResult, setPollResult] = useState<PollResult>()
    const [consts, setConsts] = useState<FindTrumanConst>()
    const [clueId, setClueId] = useState<string>('')

    useEffect(() => {
        if (!FindTruman_Const.initialized) {
            FindTruman_Const.init((resolve, reject) => {
                fetchConst(i18n.language)
                    .then((res) => {
                        resolve({ ...res, t: new FindTrumanI18n(res.locales || {}).t })
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
        FindTruman_Const.then((res) => {
            setConsts(res)
            res && setFindTrumanI18n(() => res.t)
        })
    }, [])

    useEffect(() => {
        fetchData()
    }, [account])

    const fetchData = async () => {
        postType !== FindTrumanPostType.Encryption &&
            (await fetchStoryInfo(storyId).then((res) => {
                setStoryInfo(res)
            }))
        switch (postType) {
            case FindTrumanPostType.Encryption:
                const searchParams = new URLSearchParams(url.split('?')[1])
                const payload = searchParams.get('clueId') || ''
                setClueId(payload)
                break
            case FindTrumanPostType.Status:
                !!account &&
                    (await fetchUserStoryStatus(storyId, account).then((res) => {
                        setUserStoryStatus(res)
                    }))
                break
            case FindTrumanPostType.Puzzle:
                !!account &&
                    (await fetchUserPuzzleStatus(targetId, account).then((res) => {
                        setUserPuzzleStatus(res)
                    }))
                break
            case FindTrumanPostType.Poll:
                !!account &&
                    (await fetchUserPollStatus(targetId, account).then((res) => {
                        setUserPollStatus(res)
                    }))
                break
            case FindTrumanPostType.PuzzleResult:
                !!account &&
                    (await fetchUserPuzzleStatus(targetId, account).then((res) => {
                        setUserPuzzleStatus(res)
                    }))
                await fetchPuzzleResult(targetId).then((res) => {
                    setPuzzleResult(res)
                })
                break
            case FindTrumanPostType.PollResult:
                !!account &&
                    (await fetchUserPollStatus(targetId, account).then((res) => {
                        setUserPollStatus(res)
                    }))
                await fetchPollResult(targetId).then((res) => {
                    setPollResult(res)
                })
                break
        }
    }

    const handleSubmit = (choice: number) => {
        return new Promise<boolean>((resolve, reject) => {
            switch (postType) {
                case FindTrumanPostType.Puzzle:
                    submitPuzzle(account, {
                        target: userPuzzleStatus?.id || '',
                        from: account,
                        timestamp: Math.floor(Date.now() / 1000),
                        choice,
                    })
                        .then(async (res) => {
                            await fetchData()
                            resolve(true)
                        })
                        .catch((error) => {
                            reject(false)
                        })
                    break
                case FindTrumanPostType.Poll:
                    submitPoll(account, {
                        target: userPollStatus?.id || '',
                        from: account,
                        timestamp: Math.floor(Date.now() / 1000),
                        choice,
                    })
                        .then(async (res) => {
                            await fetchData()
                            resolve(true)
                        })
                        .catch((error) => {
                            reject(false)
                        })
                    break
            }
        })
    }

    return (
        <FindTrumanContext.Provider
            value={{
                address: account,
                const: consts,
                t: findTrumanI18n,
            }}>
            <LoadingFailCard
                title=""
                isFullPluginDown={true}
                retry={() => {
                    fetchData()
                }}>
                <FindTruman
                    storyInfo={storyInfo}
                    clueId={clueId}
                    userStoryStatus={userStoryStatus}
                    userPuzzleStatus={userPuzzleStatus}
                    userPollStatus={userPollStatus}
                    puzzleResult={puzzleResult}
                    pollResult={pollResult}
                    postType={postType}
                    onSubmit={handleSubmit}
                />
            </LoadingFailCard>
        </FindTrumanContext.Provider>
    )
}
