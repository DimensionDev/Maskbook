import { FindTrumanContext } from '../context'
import { LoadingFailCard } from './LoadingFailCard'
import { FindTruman } from './FindTruman'
import {
    FindTrumanConst,
    FindTrumanI18nFunction,
    PollResult,
    PostType,
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
import getUnixTime from 'date-fns/getUnixTime'

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

    const postType: PostType = url.includes('/encryption?')
        ? PostType.Encryption
        : url.includes('/puzzles/')
        ? PostType.Puzzle
        : url.includes('/polls/')
        ? PostType.Poll
        : url.includes('/puzzle_result')
        ? PostType.PuzzleResult
        : url.includes('/poll_result/')
        ? PostType.PollResult
        : PostType.Status

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
    const [clueId, setClueId] = useState('')

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
        if (postType === PostType.Encryption) {
            const searchParams = new URLSearchParams(url.split('?')[1])
            const payload = searchParams.get('clueId') || ''
            setClueId(payload)
            return
        }
        setStoryInfo(await fetchStoryInfo(storyId))
        if (account) {
            if (postType === PostType.Status) {
                setUserStoryStatus(await fetchUserStoryStatus(storyId, account))
            } else if (postType === PostType.Puzzle || postType === PostType.PuzzleResult) {
                setUserPuzzleStatus(await fetchUserPuzzleStatus(targetId, account))
            } else if (postType === PostType.Poll || postType === PostType.PollResult) {
                setUserPollStatus(await fetchUserPollStatus(targetId, account))
            }
            if (postType === PostType.PuzzleResult) {
                setPuzzleResult(await fetchPuzzleResult(targetId))
            } else if (postType === PostType.PollResult) {
                setPollResult(await fetchPollResult(targetId))
            }
        }
    }

    const handleSubmit = async (choice: number) => {
        const from = account
        const timestamp = getUnixTime(Date.now())
        try {
            if (postType === PostType.Puzzle) {
                const target = userPuzzleStatus?.id ?? ''
                await submitPuzzle(account, { target, from, timestamp, choice })
            } else if (postType === PostType.Poll) {
                const target = userPollStatus?.id ?? ''
                await submitPoll(account, { target, from, timestamp, choice })
            }
            await fetchData()
            return true
        } catch {
            return false
        }
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
                isFullPluginDown
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
