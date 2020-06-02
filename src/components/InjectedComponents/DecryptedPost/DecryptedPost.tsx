import React, { useMemo, useState, useEffect } from 'react'
import { sleep, unreachable } from '../../../utils/utils'
import { ServicesWithProgress } from '../../../extension/service'
import type { Profile } from '../../../database'
import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
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
import { asyncIteratorWithResult } from '../../../utils/type-transform/asyncIteratorWithResult'

export interface DecryptPostProps {
    onDecrypted: (post: TypedMessage, raw: string) => void
    postBy: ProfileIdentifier
    postId?: PostIdentifier<ProfileIdentifier>
    whoAmI: ProfileIdentifier
    encryptedText: string
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
    const { postBy, postId, whoAmI, encryptedText, profiles, alreadySelectedPreviously, onDecrypted } = props
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
    const [postPayload, setPostPayload] = useState(() => deconstructPayload(encryptedText, null))
    const sharedPublic = (postPayload?.version === -38 ? postPayload.sharedPublic : false) ?? false
    useEffect(() => setPostPayload(deconstructPayload(encryptedText, null)), [encryptedText])
    const [debugHash, setDebugHash] = useState<string>('Unknown')
    //#endregion
    //#region Progress
    const [progress, setDecryptingStatus] = useState<DecryptionProgress | FailureDecryption>({
        progress: 'init',
    })
    const [decrypted, setDecrypted] = useState<SuccessDecryption | FailureDecryption | undefined>(undefined)
    //#endregion
    // Do the query
    useEffect(() => {
        const signal = new AbortController()
        async function run() {
            const iter = ServicesWithProgress.decryptFrom(encryptedText, postBy, whoAmI, sharedPublic)
            for await (const status of asyncIteratorWithResult(iter)) {
                if (signal.signal.aborted) return iter.return?.()
                if (status.done) {
                    if (sharedPublic && !('error' in status.value)) {
                        // HACK: the is patch, hidden NOT VERIFIED in everyone
                        status.value.signatureVerifyResult = true
                    }
                    return setDecrypted(status.value)
                }
                if ('debug' in status.value) {
                    switch (status.value.debug) {
                        case 'debug_finding_hash':
                            setDebugHash(status.value.hash.join('-'))
                            break
                        default:
                            unreachable(status.value.debug)
                    }
                } else setDecryptingStatus(status.value)
                if ('progress' in status.value && status.value.progress === 'intermediate_success')
                    setDecrypted(status.value.data)
            }
        }
        run().catch((e) => setDecrypted({ error: e?.message } as FailureDecryption))
        return () => signal.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [encryptedText, postBy.toText(), whoAmI.toText(), sharedPublic])

    // Report the result
    useEffect(() => {
        decrypted && !('error' in decrypted) && onDecrypted(decrypted.content, decrypted.rawContent)
    }, [decrypted, onDecrypted])

    // Decrypting
    if (decrypted === undefined) {
        // Decrypting with fixable error
        if ('error' in progress)
            return withDebugger(<Failed error={new Error(progress.error)} {...props.failedComponentProps} />)
        // Decrypting...
        else return withDebugger(<Awaiting type={progress} {...props.waitingComponentProps} />)
    }
    // Error
    if ('error' in decrypted) return <Failed error={new Error(decrypted.error)} {...props.failedComponentProps} />
    // Success
    return withDebugger(
        <Success
            data={decrypted}
            postIdentifier={postId}
            alreadySelectedPreviously={alreadySelectedPreviously}
            requestAppendRecipients={requestAppendRecipientsWrapped}
            profiles={profiles}
            sharedPublic={sharedPublic}
            {...props.successComponentProps}
        />,
    )
    function withDebugger(jsx: JSX.Element) {
        return (
            <>
                {jsx}
                <DecryptedPostDebug
                    debugHash={debugHash}
                    decryptedResult={decrypted}
                    encryptedText={encryptedText}
                    postBy={postBy}
                    postPayload={postPayload}
                    whoAmI={whoAmI}
                />
            </>
        )
    }
}
