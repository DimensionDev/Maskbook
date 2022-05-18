import { FindTrumanContext } from '../context'
import { LoadingFailCard } from './LoadingFailCard'
import { FindTruman } from './FindTruman'
import {
    CompletionQuestionAnswer,
    PollResult,
    PostType,
    PuzzleResult,
    StoryInfo,
    UserCompletionStatus,
    UserPollStatus,
    UserStoryStatus,
} from '../types'
import { useEffect, useState } from 'react'
import {
    fetchPollResult,
    fetchPuzzleResult,
    fetchStoryInfo,
    fetchUserCompletionStatus,
    fetchUserPollStatus,
    fetchUserPuzzleStatus,
    fetchUserStoryStatus,
    submitCompletion,
    submitPoll,
    submitPuzzle,
} from '../Worker/apis'
import getUnixTime from 'date-fns/getUnixTime'
import { useConst } from './hooks/useConst'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const { url } = props
    const account = useAccount(NetworkPluginID.PLUGIN_EVM).toLowerCase()
    const { consts, t } = useConst()

    const [, , , _storyId, , _targetId] = new URL(url).hash.split('/')
    const storyId = _storyId ? _storyId : ''
    const targetId = _targetId ? _targetId : ''

    const postType: PostType = url.includes('/encryption?')
        ? PostType.Encryption
        : url.includes('/puzzles/')
        ? PostType.Puzzle
        : url.includes('/polls/')
        ? PostType.Poll
        : url.includes('/completions/')
        ? PostType.Completion
        : url.includes('/puzzle_result')
        ? PostType.PuzzleResult
        : url.includes('/poll_result/')
        ? PostType.PollResult
        : PostType.Status

    const [storyInfo, setStoryInfo] = useState<StoryInfo>()
    const [userStoryStatus, setUserStoryStatus] = useState<UserStoryStatus>()
    const [userPuzzleStatus, setUserPuzzleStatus] = useState<UserPollStatus>()
    const [userPollStatus, setUserPollStatus] = useState<UserPollStatus>()
    const [userCompletionStatus, setUserCompletionStatus] = useState<UserCompletionStatus>()
    const [puzzleResult, setPuzzleResult] = useState<PuzzleResult>()
    const [pollResult, setPollResult] = useState<PollResult>()
    const [clueId, setClueId] = useState('')

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
        if (!account) return
        if (postType === PostType.Status) {
            setUserStoryStatus(await fetchUserStoryStatus(storyId, account))
        } else if (postType === PostType.Puzzle || postType === PostType.PuzzleResult) {
            setUserPuzzleStatus(await fetchUserPuzzleStatus(targetId, account))
        } else if (postType === PostType.Poll || postType === PostType.PollResult) {
            setUserPollStatus(await fetchUserPollStatus(targetId, account))
        } else if (postType === PostType.Completion) {
            setUserCompletionStatus(await fetchUserCompletionStatus(targetId, account))
        }
        if (postType === PostType.PuzzleResult) {
            setPuzzleResult(await fetchPuzzleResult(targetId))
        } else if (postType === PostType.PollResult) {
            setPollResult(await fetchPollResult(targetId))
        }
    }

    const handleSubmitPoll = async (choice: number) => {
        const from = account
        const timestamp = getUnixTime(Date.now())
        if (postType === PostType.Puzzle) {
            const target = userPuzzleStatus?.id ?? ''
            await submitPuzzle(account, { target, from, timestamp, choice })
        } else if (postType === PostType.Poll) {
            const target = userPollStatus?.id ?? ''
            await submitPoll(account, { target, from, timestamp, choice })
        }
        await fetchData()
    }

    const handleSubmitCompletion = async (answers: CompletionQuestionAnswer[]) => {
        const timestamp = getUnixTime(Date.now())
        const quesId = userCompletionStatus?.id ?? ''
        await submitCompletion(account, {
            quesId,
            answers,
            timestamp,
        })
        await fetchData()
    }

    return (
        <FindTrumanContext.Provider
            value={{
                address: account,
                const: consts,
                t,
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
                    userCompletionStatus={userCompletionStatus}
                    puzzleResult={puzzleResult}
                    pollResult={pollResult}
                    postType={postType}
                    onSubmitPoll={handleSubmitPoll}
                    onSubmitCompletion={handleSubmitCompletion}
                />
            </LoadingFailCard>
        </FindTrumanContext.Provider>
    )
}
