import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { debugModeSetting } from '../../../settings/settings'
import type { PayloadAlpha38 } from '../../../utils/type-transform/Payload'
import { usePostInfoDetails } from '../../DataSource/usePostInfo'
import { DebugList } from '../../DebugModeUI/DebugList'
import { DebugModeUI_PostHashDialog } from '../../DebugModeUI/PostHashDialog'

interface DebugDisplayProps {
    currentIdentity: ProfileIdentifier
    debugHash: string
    decryptedResult: SuccessDecryption | FailureDecryption | null
}
export function DecryptedPostDebug(props: Partial<DebugDisplayProps>) {
    const postBy = usePostInfoDetails.postBy()
    const postContent = usePostInfoDetails.postContent()
    const payloadResult = usePostInfoDetails.postPayload()
    const setting = useValueRef(debugModeSetting)
    const isDebugging = isEnvironment(Environment.ManifestOptions) ? true : setting

    const { debugHash, decryptedResult, currentIdentity } = props
    if (!isDebugging) return null
    const postByMyself = <DebugModeUI_PostHashDialog network={postBy.network} post={postContent} />
    if (payloadResult.err)
        return (
            <DebugList
                items={[
                    postBy.equals(currentIdentity) ? postByMyself : (['Hash of this post', debugHash] as const),
                    ['Payload Error', String(payloadResult.val)],
                ]}
            />
        )
    const payload = payloadResult.val
    const ownersAESKeyEncrypted = payload.version === -38 ? payload.AESKeyEncrypted : payload.ownersAESKeyEncrypted
    return (
        <DebugList
            items={[
                postBy.equals(currentIdentity) ? postByMyself : (['Hash of this post', debugHash] as const),
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
