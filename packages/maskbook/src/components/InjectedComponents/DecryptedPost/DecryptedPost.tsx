import { useMemo, useState, useEffect, useReducer, Fragment } from 'react'
import { sleep, unreachable } from '../../../utils/utils'
import { ServicesWithProgress } from '../../../extension/service'
import type { Profile } from '../../../database'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import type { TypedMessage } from '../../../protocols/typed-message'
import { DecryptPostSuccess, DecryptPostSuccessProps } from './DecryptedPostSuccess'
import { DecryptPostAwaitingProps, DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailedProps, DecryptPostFailed } from './DecryptPostFailed'
import { DecryptedPostDebug } from './DecryptedPostDebug'
import { usePostInfoDetails } from '../../DataSource/usePostInfo'
import { asyncIteratorWithResult } from '../../../utils/type-transform/asyncIteratorHelpers'
import { Err, Ok } from 'ts-results'
import { or } from '../../custom-ui-helper'
import { usePostInfo } from '../../../components/DataSource/usePostInfo'
import type { Payload } from '../../../utils/type-transform/Payload'

function progressReducer(
    state: { key: string; progress: SuccessDecryption | FailureDecryption | DecryptionProgress }[],
    payload: {
        type: 'refresh'
        key: string
        progress: SuccessDecryption | FailureDecryption | DecryptionProgress
    },
) {
    const { key, progress } = payload
    const currentProgressIndex = state.findIndex((x) => x.key === key)
    if (currentProgressIndex === -1) {
        return [
            ...state,
            {
                key,
                progress,
            },
        ]
    }
    const currentProgress = state[currentProgressIndex].progress
    if (currentProgress && currentProgress.type !== 'progress' && progress.type === 'progress') return state
    state[currentProgressIndex] = {
        key,
        progress,
    }
    return [...state]
}

export interface DecryptPostProps {
    onDecrypted: (post: TypedMessage, raw: string) => void
    whoAmI: ProfileIdentifier
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
    successComponent?: React.ComponentType<DecryptPostSuccessProps>
    successComponentProps?: Partial<DecryptPostSuccessProps>
    waitingComponent?: React.ComponentType<DecryptPostAwaitingProps>
    waitingComponentProps?: Partial<DecryptPostAwaitingProps>
    failedComponent?: React.ComponentType<DecryptPostFailedProps>
    failedComponentProps?: Partial<DecryptPostFailedProps>
}
export function DecryptPost(props: DecryptPostProps) {
    const { whoAmI, profiles, alreadySelectedPreviously, onDecrypted } = props
    const deconstructedPayload = usePostInfoDetails('postPayload')
    const authorInPayload = deconstructedPayload
        .andThen((x) => (x.version === -38 ? Ok(x.authorUserID) : Err.EMPTY))
        .unwrapOr(undefined)
    const current = usePostInfo()
    const currentPostBy = usePostInfoDetails('postBy')
    const postBy = or(authorInPayload, currentPostBy)
    const postMetadataImages = usePostInfoDetails('postMetadataImages')
    const Success = props.successComponent || DecryptPostSuccess
    const Awaiting = props.waitingComponent || DecryptPostAwaiting
    const Failed = props.failedComponent || DecryptPostFailed

    const requestAppendRecipientsWrapped = useMemo(() => {
        if (!postBy.equals(whoAmI)) return undefined
        if (!props.requestAppendRecipients) return undefined
        return async (people: Profile[]) => {
            await props.requestAppendRecipients!(people)
            await sleep(1500)
        }
    }, [props.requestAppendRecipients, postBy, whoAmI])

    //#region Debug info
    const [debugHash, setDebugHash] = useState<string>('Unknown')
    //#endregion

    //#region Progress
    const [progress, dispatch] = useReducer(progressReducer, [])
    //#endregion

    //#region decrypt

    // pass 1:
    // decrypt post content and image attachments
    const sharedPublic = deconstructedPayload
        .andThen((x) => (x.version === -38 ? Ok(!!x.sharedPublic) : Err.EMPTY))
        .unwrapOr(false)
    useEffect(() => {
        const signal = new AbortController()
        async function makeProgress(
            key: string,
            decryptionProcess: ReturnType<typeof ServicesWithProgress.decryptFromText>,
        ) {
            const refreshProgress = (progress: SuccessDecryption | FailureDecryption | DecryptionProgress) =>
                dispatch({
                    type: 'refresh',
                    key,
                    progress,
                })
            for await (const process of asyncIteratorWithResult(decryptionProcess)) {
                if (signal.signal.aborted)
                    return decryptionProcess.return?.({ type: 'error', internal: true, error: 'aborted' })
                if (process.done) {
                    if (process.value.type === 'success') current.iv.value = process.value.iv
                    return refreshProgress(process.value)
                }
                const status = process.value
                if (status.type === 'debug') {
                    switch (status.debug) {
                        case 'debug_finding_hash':
                            setDebugHash(status.hash.join('-'))
                            break
                        default:
                            unreachable(status.debug)
                    }
                } else refreshProgress(status)
                if (status.type === 'progress') {
                    if (status.progress === 'intermediate_success') refreshProgress(status.data)
                    else if (status.progress === 'iv_decrypted') current.iv.value = status.iv
                }
            }
        }

        if (deconstructedPayload.ok)
            makeProgress(
                'post text',
                ServicesWithProgress.decryptFromText(deconstructedPayload.val, postBy, whoAmI, sharedPublic),
            )
        postMetadataImages.forEach((url) => {
            if (signal.signal.aborted) return
            makeProgress(url, ServicesWithProgress.decryptFromImageUrl(url, postBy, whoAmI))
        })
        return () => signal.abort()
    }, [
        current.iv,
        deconstructedPayload.ok,
        (deconstructedPayload.val as Payload)?.encryptedText,
        postBy.toText(),
        postMetadataImages.join(),
        sharedPublic,
        whoAmI.toText(),
    ])

    // pass 2:
    // decrypt rest attachments which depend on post content
    // const decryptedPostContent = progress.find((p) => p.key === postContent)
    // useEffect(() => {
    //     if (decryptedPostContent?.progress.type !== 'success') return
    //     // TODO:
    //     // decrypt shuffled image here
    // }, [decryptedPostContent])

    // pass 3:
    // inovke callback
    const firstSucceedDecrypted = progress.find((p) => p.progress.type === 'success')
    useEffect(() => {
        if (firstSucceedDecrypted?.progress.type !== 'success') return
        onDecrypted(firstSucceedDecrypted.progress.content, firstSucceedDecrypted.progress.rawContent)
    }, [firstSucceedDecrypted, onDecrypted])
    //#endregion

    // it's not a secret post
    if (!deconstructedPayload.ok && progress.every((x) => x.progress.internal)) return null
    return (
        <>
            {progress
                // the internal progress should not display to the end-user
                .filter(({ progress }) => !progress.internal)
                .map(({ progress }, index) => (
                    <Fragment key={index}>{renderProgress(progress)}</Fragment>
                ))}
        </>
    )

    function renderProgress(progress: SuccessDecryption | FailureDecryption | DecryptionProgress) {
        const render = () => {
            switch (progress.type) {
                case 'success':
                    return (
                        <Success
                            data={progress}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            profiles={profiles}
                            sharedPublic={sharedPublic}
                            author={authorInPayload}
                            postedBy={currentPostBy}
                            {...props.successComponentProps}
                        />
                    )
                case 'error':
                    return (
                        <Failed
                            error={new Error(progress.error)}
                            author={authorInPayload}
                            postedBy={currentPostBy}
                            {...props.failedComponentProps}
                        />
                    )
                case 'progress':
                    return (
                        <Awaiting
                            type={progress}
                            author={authorInPayload}
                            postedBy={currentPostBy}
                            {...props.waitingComponentProps}
                        />
                    )
                default:
                    return null
            }
        }
        const rendered = render()
        if (!rendered) return null
        return (
            <>
                {rendered}
                <DecryptedPostDebug
                    debugHash={debugHash}
                    whoAmI={whoAmI}
                    decryptedResult={progress.type === 'progress' ? null : progress}
                />
            </>
        )
    }
}
