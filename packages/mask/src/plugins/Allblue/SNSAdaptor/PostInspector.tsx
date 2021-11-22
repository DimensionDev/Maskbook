import { AllblueContext } from '../context'
import { LoadingFailCard } from './LoadingFailCard'
import { Allblue } from './Allblue'
import {
    AllblueConsts,
    AllbluePostType,
    PollResult,
    PuzzleResult,
    StoryInfo,
    UserPollStatus,
    UserPuzzleStatus,
    UserStoryStatus,
} from '../types'
import { useAccount } from '../../../../../web3-shared/evm'
import { useEffect, useState } from 'react'
import {
    fetchConsts,
    fetchPollResult,
    fetchPuzzleResult,
    fetchStoryInfo,
    fetchUserPollStatus,
    fetchUserPuzzleStatus,
    fetchUserStoryStatus,
    submitPoll,
    submitPuzzle,
} from '../Worker/apis'
import { Allblue_Consts } from '../constants'
import { useI18N } from '../../../utils'

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

    let postType: AllbluePostType = url.includes('/encryption?')
        ? AllbluePostType.Encryption
        : url.includes('/puzzles/')
        ? AllbluePostType.Puzzle
        : url.includes('/polls/')
        ? AllbluePostType.Poll
        : url.includes('/puzzle_result')
        ? AllbluePostType.PuzzleResult
        : url.includes('/poll_result/')
        ? AllbluePostType.PollResult
        : AllbluePostType.Status

    const [storyInfo, setStoryInfo] = useState<StoryInfo>()
    const [userStoryStatus, setUserStoryStatus] = useState<UserStoryStatus>()
    const [userPuzzleStatus, setUserPuzzleStatus] = useState<UserPuzzleStatus>()
    const [userPollStatus, setUserPollStatus] = useState<UserPollStatus>()
    const [puzzleResult, setPuzzleResult] = useState<PuzzleResult>()
    const [pollResult, setPollResult] = useState<PollResult>()
    const [consts, setConsts] = useState<AllblueConsts>()
    const [encryptionPayload, setEncryptionPayload] = useState<string>('')

    useEffect(() => {
        if (!Allblue_Consts.initialized) {
            Allblue_Consts.init((resolve, reject) => {
                fetchConsts(i18n.language)
                    .then((res) => {
                        resolve(res)
                    })
                    .catch((e) => {
                        reject(e)
                    })
            })
        }
        Allblue_Consts.then((res) => {
            setConsts(res)
        })
        fetchData()
    }, [])

    const fetchData = () => {
        postType !== AllbluePostType.Encryption &&
            fetchStoryInfo(storyId).then((res) => {
                setStoryInfo(res)
            })
        switch (postType) {
            case AllbluePostType.Encryption:
                let searchParams = new URLSearchParams(url.split('?')[1])
                const payload = searchParams.get('payload') || ''
                setEncryptionPayload(payload)
                break
            case AllbluePostType.Status:
                !!account &&
                    fetchUserStoryStatus(storyId, account).then((res) => {
                        setUserStoryStatus(res)
                    })
                break
            case AllbluePostType.Puzzle:
                !!account &&
                    fetchUserPuzzleStatus(targetId, account).then((res) => {
                        setUserPuzzleStatus(res)
                    })
                break
            case AllbluePostType.Poll:
                !!account &&
                    fetchUserPollStatus(targetId, account).then((res) => {
                        setUserPollStatus(res)
                    })
                break
            case AllbluePostType.PuzzleResult:
                !!account &&
                    fetchUserPuzzleStatus(targetId, account).then((res) => {
                        setUserPuzzleStatus(res)
                    })
                fetchPuzzleResult(targetId).then((res) => {
                    setPuzzleResult(res)
                })
                break
            case AllbluePostType.PollResult:
                !!account &&
                    fetchUserPollStatus(targetId, account).then((res) => {
                        setUserPollStatus(res)
                    })
                fetchPollResult(targetId).then((res) => {
                    setPollResult(res)
                })
                break
        }
    }

    const handleSubmit = (choice: number) => {
        return new Promise<boolean>((resolve) => {
            switch (postType) {
                case AllbluePostType.Puzzle:
                    submitPuzzle(account, {
                        target: userPuzzleStatus?.id || '',
                        from: account,
                        timestamp: Math.floor(new Date().valueOf() / 1000),
                        choice,
                    })
                        .then((res) => {
                            fetchData()
                            resolve(true)
                        })
                        .catch((e) => {
                            resolve(false)
                        })
                    break
                case AllbluePostType.Poll:
                    submitPoll(account, {
                        target: userPollStatus?.id || '',
                        from: account,
                        timestamp: Math.floor(new Date().valueOf() / 1000),
                        choice,
                    })
                        .then((res) => {
                            fetchData()
                            resolve(true)
                        })
                        .catch((e) => {
                            resolve(false)
                        })
                    break
            }
        })
    }

    return (
        <AllblueContext.Provider value={{ address: account, consts }}>
            <LoadingFailCard
                title=""
                isFullPluginDown={true}
                retry={() => {
                    fetchData()
                }}>
                <Allblue
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
        </AllblueContext.Provider>
    )
}
