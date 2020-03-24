import React from 'react'
import type { Payload } from '../../../utils/type-transform/Payload'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    SuccessDecryption,
    FailureDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { DebugList } from '../../DebugModeUI/DebugList'
import { DebugModeUI_PostHashDialog } from '../../DebugModeUI/PostHashDialog'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../shared-settings/settings'
import { GetContext } from '@holoflows/kit'

interface DebugDisplayProps {
    postPayload: Payload | null
    postBy: ProfileIdentifier
    encryptedText: string
    whoAmI: ProfileIdentifier
    debugHash: string
    decryptedResult: SuccessDecryption | FailureDecryption | null
}
export const DecryptedPostDebug = React.memo(function DecryptedPostDebug(props: Partial<DebugDisplayProps>) {
    const setting = useValueRef(debugModeSetting)
    const isDebugging = GetContext() === 'options' ? true : setting

    const { debugHash, decryptedResult, encryptedText, postBy, postPayload, whoAmI } = props
    if (!isDebugging || !postPayload || !postBy) return null
    const postByMyself = <DebugModeUI_PostHashDialog network={postBy.network} post={encryptedText!} />
    const ownersAESKeyEncrypted =
        postPayload.version === -38 ? postPayload.AESKeyEncrypted : postPayload.ownersAESKeyEncrypted
    return (
        <DebugList
            items={[
                postBy.equals(whoAmI) ? postByMyself : (['Hash of this post', debugHash] as const),
                [
                    'Decrypt reason',
                    decryptedResult && !('error' in decryptedResult) ? decryptedResult.through.join(',') : 'Unknown',
                ],
                ['Payload version', postPayload.version],
                ['Payload ownersAESKeyEncrypted', ownersAESKeyEncrypted],
                ['Payload iv', postPayload.iv],
                ['Payload encryptedText', postPayload.encryptedText],
                ['Payload signature', postPayload.signature],
            ]}
        />
    )
})
