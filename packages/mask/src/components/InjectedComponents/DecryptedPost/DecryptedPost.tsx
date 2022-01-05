import { MaskPayloadContext, usePostInfoDetails } from '@masknet/plugin-infra'
import { DecryptError, DecryptProgress, DecryptProgressKind, DecryptSuccess } from '@masknet/encryption'
import type { DecryptionInfo } from '../../../../background/services/crypto/decryption'
import { DecryptPostSuccess } from './DecryptedPostSuccess'
import type { DecryptIntermediateProgress } from '@masknet/encryption/src/encryption'
import { DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailed } from './DecryptPostFailed'
import { useSubscription } from 'use-subscription'
import { findLast } from 'lodash-unified'

export function DecryptedPosts() {
    const decryptions = usePostInfoDetails.maskPayloads()
    return (
        <>
            {decryptions.map((context) => (
                <DecryptedPost {...context} key={context.id} />
            ))}
        </>
    )
}

function DecryptedPost(props: MaskPayloadContext) {
    const decryption = useSubscription(props.decrypted)
    const publicShared = useSubscription(props.publicShared)

    const success = findLast(decryption, isDecryptSuccess)
    if (success) {
        return (
            <DecryptPostSuccess
                data={success}
                // TODO:
                alreadySelectedPreviously={[]}
                profiles={[]}
                sharedPublic={publicShared}
            />
        )
    }
    const failed = findLast(decryption, isDecryptError)
    if (failed) return <DecryptPostFailed error={failed} />
    const progress = findLast(decryption, isDecryptProgress)
    if (progress) return <DecryptPostAwaiting progress={progress} />
    return null
}

function isDecryptSuccess(value: DecryptProgress | DecryptionInfo): value is DecryptSuccess {
    return value.type === DecryptProgressKind.Success
}

function isDecryptError(value: DecryptProgress | DecryptionInfo): value is DecryptError {
    return value.type === DecryptProgressKind.Error
}

function isDecryptProgress(value: DecryptProgress | DecryptionInfo): value is DecryptIntermediateProgress {
    return value.type === DecryptProgressKind.Progress
}
