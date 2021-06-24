import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { useMemo } from 'react'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { debugModeSetting } from '../../../settings/settings'
import { deconstructPayload, PayloadAlpha38 } from '../../../utils/type-transform/Payload'
import { usePostInfoDetails } from '../../DataSource/usePostInfo'
import { DebugList } from '../../DebugModeUI/DebugList'
import { DebugModeUI_PostHashDialog } from '../../DebugModeUI/PostHashDialog'

interface DebugDisplayProps {
    whoAmI: ProfileIdentifier
    debugHash: string
    decryptedResult: SuccessDecryption | FailureDecryption | null
}
export function DecryptedPostDebug(props: Partial<DebugDisplayProps>) {
    const postBy = usePostInfoDetails.postBy()
    const postContent = usePostInfoDetails.postContent()
    const payloadResult = useMemo(() => deconstructPayload(postContent), [postContent])
    const setting = useValueRef(debugModeSetting)
    const isDebugging = isEnvironment(Environment.ManifestOptions) ? true : setting

    const { debugHash, decryptedResult, whoAmI } = props
    if (!isDebugging) return null
    const postByMyself = <DebugModeUI_PostHashDialog network={postBy.network} post={postContent} />
    if (payloadResult.err)
        return (
            <DebugList
                items={[
                    postBy.equals(whoAmI) ? postByMyself : (['Hash of this post', debugHash] as const),
                    ['Payload Error', payloadResult.val.message],
                ]}
            />
        )
    const payload = payloadResult.val
    const ownersAESKeyEncrypted = payload.version === -38 ? payload.AESKeyEncrypted : payload.ownersAESKeyEncrypted
    return (
        <DebugList
            items={[
                postBy.equals(whoAmI) ? postByMyself : (['Hash of this post', debugHash] as const),
                [
                    'Decrypt reason',
                    decryptedResult && decryptedResult.type !== 'error' ? decryptedResult.through.join(',') : 'Unknown',
                ],
                ['Version', payload.version],
                ['ownersAESKeyEncrypted', ownersAESKeyEncrypted],
                ['IV', payload.iv],
                ['EncryptedText', payload.encryptedText],
                ['Signature', payload.signature],
                ['sharedPublic (v38)', (payload as PayloadAlpha38).sharedPublic],
                ['authorPublicKey (v38)', (payload as PayloadAlpha38).authorPublicKey],
            ]}
        />
    )
}
