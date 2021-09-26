import { Fragment, useEffect, useReducer, useState } from 'react'
import { makeTypedMessageTuple, TypedMessageTuple, or } from '@masknet/shared'
import { unreachable } from '@dimensiondev/kit'

import { ServicesWithProgress } from '../../../extension/service'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { DecryptPostSuccess, DecryptPostSuccessProps } from './DecryptedPostSuccess'
import { DecryptPostAwaiting, DecryptPostAwaitingProps } from './DecryptPostAwaiting'
import { DecryptPostFailed, DecryptPostFailedProps } from './DecryptPostFailed'
import { DecryptedPostDebug } from './DecryptedPostDebug'
import { usePostClaimedAuthor, usePostInfoDetails, usePostInfoSharedPublic } from '../../DataSource/usePostInfo'
import { asyncIteratorWithResult } from '../../../utils/type-transform/asyncIteratorHelpers'
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
    onDecrypted: (post: TypedMessageTuple) => void
    currentIdentity: ProfileIdentifier
    successComponent?: React.ComponentType<DecryptPostSuccessProps>
    successComponentProps?: Partial<DecryptPostSuccessProps>
    waitingComponent?: React.ComponentType<DecryptPostAwaitingProps>
    waitingComponentProps?: Partial<DecryptPostAwaitingProps>
    failedComponent?: React.ComponentType<DecryptPostFailedProps>
    failedComponentProps?: Partial<DecryptPostFailedProps>
}
export function DecryptPost(props: DecryptPostProps) {
    const { currentIdentity, onDecrypted } = props
    const deconstructedPayload = usePostInfoDetails.postPayload()
    const authorInPayload = usePostClaimedAuthor()
    const current = usePostInfo()!
    const currentPostBy = usePostInfoDetails.postBy()
    const decryptedPayloadForImage = usePostInfoDetails.decryptedPayloadForImage()
    const postBy = or(authorInPayload, currentPostBy)
    const postMetadataImages = usePostInfoDetails.postMetadataImages()
    const Success = props.successComponent || DecryptPostSuccess
    const Awaiting = props.waitingComponent || DecryptPostAwaiting
    const Failed = props.failedComponent || DecryptPostFailed

    //#region Debug info
    const [debugHash, setDebugHash] = useState<string>('Unknown')
    //#endregion

    //#region Progress
    const [progress, dispatch] = useReducer(progressReducer, [])
    //#endregion

    //#region decrypt

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
                    else if (status.progress === 'payload_decrypted')
                        current.decryptedPayloadForImage.value = status.decryptedPayloadForImage
                }
            }
        }

        const postURL = current.url.getCurrentValue()?.toString()
        if (deconstructedPayload.ok)
            makeProgress(
                'post text',
                ServicesWithProgress.decryptFromText(
                    deconstructedPayload.val,
                    postBy,
                    currentIdentity.network,
                    currentIdentity,
                    postURL,
                ),
            )
        postMetadataImages.forEach((url) => {
            if (signal.signal.aborted) return
            makeProgress(
                url,
                ServicesWithProgress.decryptFromImageUrl(
                    url,
                    postBy,
                    currentIdentity.network,
                    currentIdentity,
                    postURL,
                ),
            )
        })
        return () => signal.abort()
    }, [
        current.iv,
        deconstructedPayload.ok,
        (deconstructedPayload.val as Payload)?.encryptedText,
        postBy.toText(),
        postMetadataImages.join(),
        currentIdentity.toText(),
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
                    currentIdentity={currentIdentity}
                    decryptedResult={progress.type === 'progress' ? null : progress}
                />
            </>
        )
    }
}
