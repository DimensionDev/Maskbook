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
import type { PostInfoAttachment, PostInfoTextAttachment } from '../../../social-network/PostInfo'
import { getActivatedUI } from '../../../social-network/ui'

function progressReducer(
    state: { key: string; progress: SuccessDecryption | FailureDecryption | DecryptionProgress }[],
    {
        key,
        progress,
    }: {
        type: 'refresh'
        key: string
        progress: SuccessDecryption | FailureDecryption | DecryptionProgress
    },
) {
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
    const attachments = usePostInfoDetails('postAttachments')
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

    //#region decrypt attachment
    const sharedPublic =
        deconstructedPayload.ok && deconstructedPayload.val.version === -38
            ? !!deconstructedPayload.val.sharedPublic
            : false
    const allAttachments = deconstructedPayload.ok
        ? [
              {
                  type: 'text',
                  content: postContent,
              } as PostInfoTextAttachment,
              ...attachments,
          ]
        : attachments

    useEffect(() => {
        const signal = new AbortController()
        async function run(attachment: PostInfoAttachment) {
            const refreshProgress = (progress: SuccessDecryption | FailureDecryption | DecryptionProgress) =>
                dispatch({
                    type: 'refresh',
                    key: attachment.type === 'text' ? attachment.content : attachment.url,
                    progress,
                })
            const iter =
                attachment.type === 'text'
                    ? ServicesWithProgress.decryptFromText(attachment, postBy, whoAmI, sharedPublic)
                    : ServicesWithProgress.decryptFromImage(attachment, postBy, whoAmI, sharedPublic)
            for await (const status of asyncIteratorWithResult(iter)) {
                if (signal.signal.aborted) return iter.return?.()
                if (status.done) {
                    // HACK: the is patch, hidden NOT VERIFIED in everyone
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
        allAttachments.forEach(run)
        return () => signal.abort()
    }, [
        allAttachments.map((attachment) => (attachment.type === 'text' ? attachment.content : attachment.url)).join(),
        postBy.toText(),
        whoAmI.toText(),
        sharedPublic,
    ])
    //#endregion

    const progressValues = progress.map((p) => p.progress)
    if (!deconstructedPayload.ok && progressValues.every((x) => x.type === 'error')) return null
    return (
        <>
            {progressValues.map((progress, index) => (
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
