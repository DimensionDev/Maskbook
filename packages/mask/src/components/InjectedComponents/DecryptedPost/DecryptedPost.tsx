import { Fragment, useEffect, useMemo, useReducer } from 'react'
import { makeTypedMessageTuple, TypedMessageTuple, type ProfileIdentifier, type Payload } from '@masknet/shared-base'
import { or } from '@masknet/theme'

import { ServicesWithProgress } from '../../../extension/service'
import type { Profile } from '../../../database'
import type {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { DecryptPostSuccess, DecryptPostSuccessProps } from './DecryptedPostSuccess'
import { DecryptPostAwaiting, DecryptPostAwaitingProps } from './DecryptPostAwaiting'
import { DecryptPostFailed, DecryptPostFailedProps } from './DecryptPostFailed'
import {
    usePostClaimedAuthor,
    usePostInfoDetails,
    usePostInfoSharedPublic,
    usePostInfo,
} from '../../DataSource/usePostInfo'
import { asyncIteratorWithResult } from '../../../utils/type-transform/asyncIteratorHelpers'
import { delay } from '@dimensiondev/kit'

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
    onDecrypted: (post: TypedMessageTuple) => void
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
    const deconstructedPayload = usePostInfoDetails.containingMaskPayload()
    const authorInPayload = usePostClaimedAuthor()
    const current = usePostInfo()!
    const currentPostBy = usePostInfoDetails.author()
    const decryptedPayloadForImage = usePostInfoDetails.decryptedPayloadForImage()
    const postBy = or(authorInPayload, currentPostBy)
    const postMetadataImages = usePostInfoDetails.postMetadataImages()
    const Success = props.successComponent || DecryptPostSuccess
    const Awaiting = props.waitingComponent || DecryptPostAwaiting
    const Failed = props.failedComponent || DecryptPostFailed

    const requestAppendRecipientsWrapped = useMemo(() => {
        if (!postBy.equals(whoAmI)) return undefined
        if (!props.requestAppendRecipients) return undefined
        return async (people: Profile[]) => {
            await props.requestAppendRecipients!(people)
            await delay(1500)
        }
    }, [props.requestAppendRecipients, postBy, whoAmI])

    // #region Progress
    const [progress, dispatch] = useReducer(progressReducer, [])
    // #endregion

    // #region decrypt

    // pass 1:
    // decrypt post content and image attachments
    const decryptedPayloadForImageAlpha38 = decryptedPayloadForImage?.version === -38 ? decryptedPayloadForImage : null
    const sharedPublic = usePostInfoSharedPublic() || decryptedPayloadForImageAlpha38?.sharedPublic || false

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
                    if (process.value.type === 'success') {
                        current.iv.value = process.value.iv
                        current.decryptedPayloadForImage.value = process.value.decryptedPayloadForImage
                    }
                    return refreshProgress(process.value)
                }
                const status = process.value
                refreshProgress(status)
                if (status.type === 'progress') {
                    if (status.progress === 'intermediate_success') refreshProgress(status.data)
                    else if (status.progress === 'iv_decrypted') current.iv.value = status.iv
                    else if (status.progress === 'payload_decrypted')
                        current.decryptedPayloadForImage.value = status.decryptedPayloadForImage
                }
            }
        }

        const postURL = current.url.getCurrentValue()?.toString()
        if (deconstructedPayload.ok)
            makeProgress(
                'post text',
                ServicesWithProgress.decryptFromText(deconstructedPayload.val, postBy, whoAmI.network, whoAmI, postURL),
            )
        postMetadataImages.forEach((url) => {
            if (signal.signal.aborted) return
            makeProgress(url, ServicesWithProgress.decryptFromImageUrl(url, postBy, whoAmI.network, whoAmI, postURL))
        })
        return () => signal.abort()
    }, [
        current.iv,
        deconstructedPayload.ok,
        (deconstructedPayload.val as Payload)?.encryptedText,
        postBy.toText(),
        postMetadataImages.join(),
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
    // invoke callback
    const firstSucceedDecrypted = progress.find((p) => p.progress.type === 'success')
    useEffect(() => {
        if (firstSucceedDecrypted?.progress.type !== 'success') return
        onDecrypted(makeTypedMessageTuple([firstSucceedDecrypted.progress.content]))
    }, [firstSucceedDecrypted, onDecrypted])
    // #endregion

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
}
