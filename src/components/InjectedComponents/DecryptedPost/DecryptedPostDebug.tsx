import React, { useMemo } from 'react'
import type { ProfileIdentifier } from '../../../database/type'
import type {
    SuccessDecryption,
    FailureDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { DebugList } from '../../DebugModeUI/DebugList'
import { DebugModeUI_PostHashDialog } from '../../DebugModeUI/PostHashDialog'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../../settings/settings'
import { GetContext } from '@holoflows/kit'
import { usePostInfoDetails } from '../../DataSource/usePostInfo'
import { getActivatedUI } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'

interface DebugDisplayProps {
    whoAmI: ProfileIdentifier
    debugHash: string
    decryptedResult: SuccessDecryption | FailureDecryption | null
}
export const DecryptedPostDebug = React.memo(function DecryptedPostDebug(props: Partial<DebugDisplayProps>) {
    const postBy = usePostInfoDetails('postBy')
    const postContent = usePostInfoDetails('postContent')
    const deconstructedPayload = useMemo(() => deconstructPayload(postContent, getActivatedUI().payloadDecoder), [
        postContent,
    ])
    const setting = useValueRef(debugModeSetting)
    const isDebugging = GetContext() === 'options' ? true : setting

    const { debugHash, decryptedResult, whoAmI } = props
    if (!isDebugging || !deconstructedPayload || !deconstructedPayload.ok || !postBy) return null
    const payload = deconstructedPayload.unwrap()
    const postByMyself = <DebugModeUI_PostHashDialog network={postBy.network} post={postContent} />
    const ownersAESKeyEncrypted = payload.version === -38 ? payload.AESKeyEncrypted : payload.ownersAESKeyEncrypted
    return (
        <DebugList
            items={[
                postBy.equals(whoAmI) ? postByMyself : (['Hash of this post', debugHash] as const),
                [
                    'Decrypt reason',
                    decryptedResult && decryptedResult.type !== 'error' ? decryptedResult.through.join(',') : 'Unknown',
                ],
                ['Payload version', payload.version],
                ['Payload ownersAESKeyEncrypted', ownersAESKeyEncrypted],
                ['Payload iv', payload.iv],
                ['Payload encryptedText', payload.encryptedText],
                ['Payload signature', payload.signature],
            ]}
        />
    )
})
