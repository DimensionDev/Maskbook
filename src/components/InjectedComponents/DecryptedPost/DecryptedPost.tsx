import React, { useMemo, useState, useEffect } from 'react'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import { sleep } from '../../../utils/utils'
import { ServicesWithProgress } from '../../../extension/service'
import { Profile } from '../../../database'
import { Identifier, ProfileIdentifier, PostIdentifier } from '../../../database/type'
import {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../shared-settings/settings'
import { DebugModeUI_PostHashDialog } from '../../DebugModeUI/PostHashDialog'
import { GetContext } from '@holoflows/kit/es'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { DebugList } from '../../DebugModeUI/DebugList'
import { TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import { DecryptPostSuccess, DecryptPostSuccessProps } from './DecryptedPostSuccess'
import { DecryptPostAwaitingProps, DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailedProps, DecryptPostFailed } from './DecryptPostFailed'
import { DecryptedPostDebug } from './DecryptedPostDebug'

export interface DecryptPostProps {
    onDecrypted(post: TypedMessage): void
    onDecryptedRaw?(post: string): void
    postBy: ProfileIdentifier
    postId?: PostIdentifier<ProfileIdentifier>
    whoAmI: ProfileIdentifier
    encryptedText: string
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
    disableSuccessDecryptionCache?: boolean // ! not used
    successComponent?: React.ComponentType<DecryptPostSuccessProps>
    successComponentProps?: Partial<DecryptPostSuccessProps>
    waitingComponent?: React.ComponentType<DecryptPostAwaitingProps>
    waitingComponentProps?: Partial<DecryptPostAwaitingProps>
    failedComponent?: React.ComponentType<DecryptPostFailedProps>
    failedComponentProps?: Partial<DecryptPostFailedProps>
}
export function DecryptPost(props: DecryptPostProps) {
    const Success = props.successComponent || DecryptPostSuccess
    const Awaiting = props.waitingComponent || DecryptPostAwaiting
    const Failed = props.failedComponent || DecryptPostFailed

    const {
        postBy,
        postId,
        whoAmI,
        encryptedText,
        profiles,
        alreadySelectedPreviously,
        requestAppendRecipients,
    } = props

    const [decryptedResult, setDecryptedResult] = useState<null | SuccessDecryption>(null)
    const [decryptingStatus, setDecryptingStatus] = useState<DecryptionProgress | FailureDecryption | undefined>(
        undefined,
    )

    const [postPayload, setPostPayload] = useState(() => deconstructPayload(encryptedText, null))
    const sharedPublic = (postPayload?.version === -38 ? postPayload.sharedPublic : false) ?? false
    useEffect(() => setPostPayload(deconstructPayload(encryptedText, null)), [encryptedText])

    const [debugHash, setDebugHash] = useState<string>('Unknown')

    const requestAppendRecipientsWrapped = useMemo(() => {
        if (!postBy.equals(whoAmI)) return undefined
        if (!requestAppendRecipients) return undefined
        return async (people: Profile[]) => {
            await requestAppendRecipients!(people)
            await sleep(1500)
        }
    }, [requestAppendRecipients, postBy, whoAmI])

    const awaitingComponent =
        decryptingStatus && 'error' in decryptingStatus ? (
            <Failed error={new Error(decryptingStatus.error)} {...props.failedComponentProps} />
        ) : (
            <Awaiting type={decryptingStatus} {...props.waitingComponentProps} />
        )
    return (
        <>
            <AsyncComponent
                promise={async () => {
                    const iter = ServicesWithProgress.decryptFrom(encryptedText, postBy, whoAmI, sharedPublic)
                    let last = await iter.next()
                    while (!last.done) {
                        if ('debug' in last.value) {
                            switch (last.value.debug) {
                                case 'debug_finding_hash':
                                    setDebugHash(last.value.hash.join('-'))
                            }
                        } else {
                            setDecryptingStatus(last.value)
                        }
                        last = await iter.next()
                    }
                    return last.value
                }}
                dependencies={[
                    encryptedText,
                    postBy.toText(),
                    whoAmI.toText(),
                    Identifier.IdentifiersToString(profiles.map(x => x.identifier)),
                    Identifier.IdentifiersToString(alreadySelectedPreviously.map(x => x.identifier)),
                ]}
                awaitingComponent={awaitingComponent}
                completeComponent={result => {
                    if ('error' in result.data) {
                        return <Failed error={new Error(result.data.error)} {...props.failedComponentProps} />
                    }
                    setDecryptedResult(result.data)
                    props.onDecrypted(result.data.content)
                    props.onDecryptedRaw?.(result.data.rawContent)

                    // HACK: the is patch, hidden NOT VERIFIED in everyone
                    if (sharedPublic) {
                        result.data.signatureVerifyResult = true
                    }

                    return (
                        <Success
                            data={result.data}
                            postIdentifier={postId}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            profiles={profiles}
                            sharedPublic={sharedPublic}
                            {...props.successComponentProps}
                        />
                    )
                }}
                failedComponent={DecryptPostFailed}
            />
            <DecryptedPostDebug
                debugHash={debugHash}
                decryptedResult={decryptedResult}
                encryptedText={encryptedText}
                postBy={postBy}
                postPayload={postPayload}
                whoAmI={whoAmI}
            />
        </>
    )
}
