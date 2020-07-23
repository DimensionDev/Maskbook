import React, { useMemo, useState, useEffect, useReducer } from 'react'
import { sleep, unreachable } from '../../../utils/utils'
import { ServicesWithProgress } from '../../../extension/service'
import type { Profile } from '../../../database'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import type { TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import { DecryptPostSuccess, DecryptPostSuccessProps } from './DecryptedPostSuccess'
import { DecryptPostAwaitingProps, DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailedProps, DecryptPostFailed } from './DecryptPostFailed'
import { DecryptedPostDebug } from './DecryptedPostDebug'
import { usePostInfoDetails } from '../../DataSource/usePostInfo'
import { asyncIteratorWithResult } from '../../../utils/type-transform/asyncIteratorHelpers'
import { getActivatedUI } from '../../../social-network/ui'

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
    const postBy = usePostInfoDetails('postBy')
    const postContent = usePostInfoDetails('postContent')
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
    const deconstructedPayload = useMemo(() => deconstructPayload(postContent, getActivatedUI().payloadDecoder), [
        postContent,
    ])

    //#region Debug info
    const [debugHash, setDebugHash] = useState<string>('Unknown')
    //#endregion

    //#region Progress
    const [progress, dispatch] = useReducer(progressReducer, [])
    //#endregion

    //#region decrypt

    // pass 1:
    // decrypt post content and image attachments
    const sharedPublic =
        deconstructedPayload.ok && deconstructedPayload.val.version === -38
            ? !!deconstructedPayload.val.sharedPublic
            : false
    useEffect(() => {
        const controller = new AbortController()
        async function makeProgress(key: string, iter: ReturnType<typeof ServicesWithProgress.decryptFromText>) {
            const refreshProgress = (progress: SuccessDecryption | FailureDecryption | DecryptionProgress) =>
                dispatch({
                    type: 'refresh',
                    key,
                    progress,
                })
            for await (const status of asyncIteratorWithResult(iter)) {
                if (controller.signal.aborted) return iter.return?.()
                if (status.done) {
                    // HACK: this is patch, hidden NOT VERIFIED in everyone
                    if (sharedPublic && status.value.type !== 'error') status.value.signatureVerifyResult = true
                    return refreshProgress(status.value)
                }
                if (status.value.type === 'debug') {
                    switch (status.value.debug) {
                        case 'debug_finding_hash':
                            setDebugHash(status.value.hash.join('-'))
                            break
                        default:
                            unreachable(status.value.debug)
                    }
                } else refreshProgress(status.value)
                if (status.value.type === 'progress' && status.value.progress === 'intermediate_success')
                    refreshProgress(status.value.data)
            }
        }

        if (deconstructedPayload.ok)
            makeProgress(postContent, ServicesWithProgress.decryptFromText(postContent, postBy, whoAmI, sharedPublic))
        postMetadataImages.forEach((url) => {
            if (controller.signal.aborted) return
            makeProgress(url, ServicesWithProgress.decryptFromImageUrl(url, postBy, whoAmI))
        })
        return () => controller.abort()
    }, [postContent, postMetadataImages.join(), postBy.toText(), whoAmI.toText(), sharedPublic])

    // pass 2:
    // decrypt rest attachments which depend on post content
    const decryptedPostContent = progress.find((p) => p.key === postContent)
    useEffect(() => {
        if (decryptedPostContent?.progress.type !== 'success') return
        // TODO:
        // decrypt shuffled image here
    }, [decryptedPostContent])

    // pass 3:
    // inovke callback
    const firstSucceedDecrypted = progress.find((p) => p.progress.type === 'success')
    useEffect(() => {
        if (firstSucceedDecrypted?.progress.type !== 'success') return
        onDecrypted(firstSucceedDecrypted.progress.content, firstSucceedDecrypted.progress.rawContent)
    }, [firstSucceedDecrypted])
    //#endregion

    if (!deconstructedPayload.ok && progress.every((x) => x.progress.type === 'error')) return null
    return (
        <>
            {progress
                .filter(({ key, progress }) => key === postContent || progress.type !== 'error')
                .map(({ progress }, index) => (
                    <React.Fragment key={index}>{renderProgress(progress)}</React.Fragment>
                ))}
        </>
    )

    function renderProgress(progress: SuccessDecryption | FailureDecryption | DecryptionProgress) {
        const withDebugger = (jsx: JSX.Element) => {
            return (
                <>
                    {jsx}
                    <DecryptedPostDebug
                        debugHash={debugHash}
                        whoAmI={whoAmI}
                        decryptedResult={progress.type === 'progress' ? null : progress}
                    />
                </>
            )
        }
        switch (progress.type) {
            case 'success':
                return withDebugger(
                    <Success
                        data={progress}
                        alreadySelectedPreviously={alreadySelectedPreviously}
                        requestAppendRecipients={requestAppendRecipientsWrapped}
                        profiles={profiles}
                        sharedPublic={sharedPublic}
                        {...props.successComponentProps}
                    />,
                )
            case 'error':
                return withDebugger(<Failed error={new Error(progress.error)} {...props.failedComponentProps} />)
            case 'progress':
                return withDebugger(<Awaiting type={progress} {...props.waitingComponentProps} />)
            default:
                return null
        }
    }
}
