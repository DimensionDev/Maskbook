import { Fragment, useContext, useEffect, useReducer, type Dispatch, type SetStateAction } from 'react'
import { extractTextFromTypedMessage, isTypedMessageEqual, type TypedMessage } from '@masknet/typed-message'
import {
    RedPacketMetaKey,
    RedPacketNftMetaKey,
    SolanaRedPacketMetaKey,
    type ProfileIdentifier,
} from '@masknet/shared-base'

import Services, { GeneratorServices } from '#services'
import type { DecryptionProgress, FailureDecryption, SuccessDecryption } from './types.js'
import { DecryptPostSuccess } from './DecryptedPostSuccess.js'
import { DecryptPostAwaiting } from './DecryptPostAwaiting.js'
import { DecryptPostFailed } from './DecryptPostFailed.js'
import { encodeArrayBuffer, safeUnreachable } from '@masknet/kit'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import type { DecryptionContext, EncodedPayload } from '../../../../background/services/crypto/decryption.js'
import { DecryptIntermediateProgressKind, DecryptProgressKind } from '@masknet/encryption'
import { type PostContext, usePostInfoDetails, PostInfoContext } from '@masknet/plugin-infra/content-script'
import { Some } from 'ts-results-es'
import { uniqWith } from 'lodash-es'

type PossibleProgress = SuccessDecryption | FailureDecryption | DecryptionProgress

function progressReducer(
    state: Array<{
        key: string
        progress: PossibleProgress
    }>,
    payload: {
        type: 'refresh'
        key: string
        progress: PossibleProgress
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

interface DecryptPostProps {
    whoAmI: ProfileIdentifier | null
    onImageDecrypted: Dispatch<SetStateAction<string[]>>
}
function isProgressEqual(a: PossibleProgress, b: PossibleProgress) {
    if (a.type !== b.type) return false
    if (a.internal !== b.internal) return false
    if (a.type === 'success') return isTypedMessageEqual(a, b as SuccessDecryption)
    if (a.type === 'error') return a.error === (b as FailureDecryption).error
    if (a.type === 'progress') return a.progress === (b as DecryptionProgress).progress
    safeUnreachable(a)
    return false
}
export function DecryptPost({ whoAmI, onImageDecrypted }: DecryptPostProps) {
    const deconstructedPayload = usePostInfoDetails.hasMaskPayload()
    const currentPostBy = usePostInfoDetails.author()
    // TODO: we should read this from the payload.
    const authorInPayload = usePostInfoDetails.author()
    const postBy = authorInPayload || currentPostBy
    const postMetadataImages = usePostInfoDetails.postMetadataImages()
    const mentionedLinks = usePostInfoDetails.mentionedLinks()
    const postInfo = useContext(PostInfoContext)!

    const [progress, dispatch] = useReducer(progressReducer, [])

    useEffect(() => {
        function setCommentFns(iv: Uint8Array, message: TypedMessage) {
            const text = extractTextFromTypedMessage(message).expect('TypedMessage should have one or more text part')
            postInfo.encryptComment.value = async (comment) => Services.Crypto.encryptComment(iv, text, comment)
            postInfo.decryptComment.value = async (encryptedComment) =>
                Services.Crypto.decryptComment(iv, text, encryptedComment)
        }
        const signal = new AbortController()
        const postURL = postInfo.url.getCurrentValue()?.toString()
        const report =
            (key: string): ReportProgress =>
            (kind, message) => {
                if (kind === 'e2e') {
                    dispatch({
                        type: 'refresh',
                        key,
                        progress: { type: 'progress', progress: 'finding_post_key', internal: false },
                    })
                } else {
                    dispatch({
                        type: 'refresh',
                        key,
                        progress: { type: 'error', error: message, internal: false },
                    })
                }
            }
        if (deconstructedPayload) {
            makeProgress(
                postURL,
                postBy,
                whoAmI,
                {
                    type: 'text',
                    text:
                        extractTextFromTypedMessage(postInfo.rawMessage.getCurrentValue()).unwrapOr('') +
                        ' ' +
                        mentionedLinks.join(' '),
                },
                (message, iv) => {
                    setCommentFns(iv, message)
                    dispatch({
                        type: 'refresh',
                        key: 'text',
                        progress: {
                            type: 'success',
                            content: message,
                            internal: false,
                            iv: encodeArrayBuffer(iv),
                        },
                    })
                },
                postInfo.decryptedReport,
                report('text'),
                signal.signal,
            )
        }
        postMetadataImages.forEach((url) => {
            if (signal.signal.aborted) return
            makeProgress(
                postURL,
                postBy,
                whoAmI,
                { type: 'image-url', image: url },
                (message, iv) => {
                    setCommentFns(iv, message)
                    dispatch({
                        type: 'refresh',
                        key: url,
                        progress: {
                            type: 'success',
                            content: message,
                            internal: false,
                            iv: encodeArrayBuffer(iv),
                        },
                    })
                    if (!message.meta) return
                    // For now, we only care about RedPacket payload
                    if (
                        message.meta.has(RedPacketMetaKey) ||
                        message.meta.has(RedPacketNftMetaKey) ||
                        message.meta.has(SolanaRedPacketMetaKey)
                    ) {
                        onImageDecrypted((images) => (images.includes(url) ? images : [...images, url]))
                    }
                },
                postInfo.decryptedReport,
                report(url),
                signal.signal,
            )
        })
        return () => signal.abort()
    }, [deconstructedPayload, postBy, postMetadataImages.join(','), whoAmI, mentionedLinks.join(',')])

    if (
        !deconstructedPayload &&
        !progress.some((x) => x.progress.type === 'success') &&
        progress.every((x) => x.progress.internal)
    )
        return null
    return (
        <>
            {uniqWith(progress, (a, b) => isProgressEqual(a.progress, b.progress))
                // the internal progress should not display to the end-user
                .filter(({ progress }) => !progress.internal)
                .map(({ progress, key }) => (
                    <Fragment key={key}>{renderProgress(progress)}</Fragment>
                ))}
        </>
    )

    function renderProgress(progress: SuccessDecryption | FailureDecryption | DecryptionProgress) {
        switch (progress.type) {
            case 'success':
                return (
                    <DecryptPostSuccess
                        author={authorInPayload}
                        postedBy={currentPostBy}
                        whoAmI={whoAmI}
                        message={progress.content}
                    />
                )
            case 'error':
                return (
                    <DecryptPostFailed
                        error={new Error(progress.error)}
                        author={authorInPayload}
                        postedBy={currentPostBy}
                    />
                )
            case 'progress':
                return <DecryptPostAwaiting type={progress} author={authorInPayload} postedBy={currentPostBy} />
            default:
                return null
        }
    }
}

type ReportProgress = (type: 'e2e' | 'error', message: string) => void
async function makeProgress(
    postURL: string | undefined,
    authorHint: ProfileIdentifier | null,
    currentProfile: ProfileIdentifier | null,
    payload: EncodedPayload,
    done: (message: TypedMessage, iv: Uint8Array) => void,
    reporter: PostContext['decryptedReport'],
    reportProgress: ReportProgress,
    signal: AbortSignal,
) {
    const context: DecryptionContext = {
        postURL,
        authorHint,
        currentProfile,
        encryptPayloadNetwork: activatedSiteAdaptorUI!.encryptPayloadNetwork,
    }
    let iv: Uint8Array | undefined
    for await (const progress of GeneratorServices.decrypt(payload, context)) {
        if (signal.aborted) return
        if (progress.type === DecryptProgressKind.Success) {
            done(progress.content, iv || new Uint8Array())
        } else if (progress.type === DecryptProgressKind.Info) {
            iv ??= progress.iv
            if (typeof progress.isAuthorOfPost === 'boolean')
                reporter({ isAuthorOfPost: Some(progress.isAuthorOfPost) })
            if (progress.iv) reporter({ iv: encodeArrayBuffer(progress.iv) })
            if (progress.version) reporter({ version: progress.version })
            if (typeof progress.publicShared === 'boolean') reporter({ sharedPublic: Some(progress.publicShared) })
        } else if (progress.type === DecryptProgressKind.Progress) {
            if (progress.event === DecryptIntermediateProgressKind.TryDecryptByE2E) reportProgress('e2e', '')
            else safeUnreachable(progress.event)
        } else if (progress.type === DecryptProgressKind.Error) {
        } else safeUnreachable(progress)
    }
}
