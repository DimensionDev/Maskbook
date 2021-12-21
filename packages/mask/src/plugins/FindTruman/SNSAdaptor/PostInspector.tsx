import { FindTrumanContext } from '../context'
import { LoadingFailCard } from './LoadingFailCard'
import { FindTruman } from './FindTruman'
import {
    FindTrumanConst,
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

    const [storyInfo, setStoryInfo] = useState<StoryInfo>()
    const [userStoryStatus, setUserStoryStatus] = useState<UserStoryStatus>()
    const [userPuzzleStatus, setUserPuzzleStatus] = useState<UserPuzzleStatus>()
    const [userPollStatus, setUserPollStatus] = useState<UserPollStatus>()
    const [puzzleResult, setPuzzleResult] = useState<PuzzleResult>()
    const [pollResult, setPollResult] = useState<PollResult>()
    const [consts, setConsts] = useState<FindTrumanConst>()
    const [encryptionPayload, setEncryptionPayload] = useState<string>('')

    useEffect(() => {
        if (!FindTruman_Const.initialized) {
            FindTruman_Const.init((resolve, reject) => {
                fetchConst(i18n.language)
                    .then((res) => {
                        resolve(res)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
        FindTruman_Const.then((res) => {
            setConsts(res)
        })
    }, [])

    useEffect(() => {
        fetchData()
    }, [account])

    const fetchData = async () => {
        if (postType === FindTrumanPostType.Encryption) {
            const searchParams = new URLSearchParams(url.split('?')[1])
            const payload = searchParams.get('payload') || ''
            setEncryptionPayload(payload)
            return
        }
        setStoryInfo(await fetchStoryInfo(storyId))
        if (account) {
            if (postType === FindTrumanPostType.Status) {
                setUserStoryStatus(await fetchUserStoryStatus(storyId, account))
            } else if (postType === FindTrumanPostType.Puzzle || postType === FindTrumanPostType.PuzzleResult) {
                setUserPuzzleStatus(await fetchUserPuzzleStatus(targetId, account))
            } else if (postType === FindTrumanPostType.Poll || postType === FindTrumanPostType.PollResult) {
                setUserPollStatus(await fetchUserPollStatus(targetId, account))
            }
        }
        if (postType === FindTrumanPostType.PuzzleResult) {
            setPuzzleResult(await fetchPuzzleResult(targetId))
        } else if (postType === FindTrumanPostType.PollResult) {
            setPollResult(await fetchPollResult(targetId))
        }
    }

    const handleSubmit = async (choice: number) => {
        const from = account
        const timestamp = getUnixTime(Date.now())
        try {
            if (postType === FindTrumanPostType.Puzzle) {
                const target = userPuzzleStatus?.id ?? ''
                await submitPuzzle(account, { target, from, timestamp, choice })
            } else if (postType === FindTrumanPostType.Poll) {
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
        <FindTrumanContext.Provider value={{ address: account, const: consts }}>
            <LoadingFailCard title="" isFullPluginDown retry={fetchData}>
                <FindTruman
                    storyInfo={storyInfo}
                    encryptionPayload={encryptionPayload}
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
