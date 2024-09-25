import { memo } from 'react'
import { AdditionalContent } from '../AdditionalPostContent.js'
import type { DecryptionProgress } from './types.js'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { useAuthorDifferentMessage } from './authorDifferentMessage.js'
import { Trans } from '@lingui/macro'
interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { author, postedBy, type } = props
    const key = {
        finding_post_key: (
            <Trans>
                Mask is getting the key to decrypt. If you see this for a long time, this post might not be shared to
                you.
            </Trans>
        ),
        finding_person_public_key: <Trans>Mask is looking for the public key of the author…</Trans>,
        init: <Trans>Mask decrypting…</Trans>,
        decode_post: <Trans>Mask decoding…</Trans>,
        iv_decrypted: <Trans>Mask decoding…</Trans>,
        payload_decrypted: <Trans>Mask decoding…</Trans>,
        intermediate_success: 'unreachable case. it should display success UI',
        undefined: <Trans>Mask decrypting…</Trans>,
    } as const
    return (
        <AdditionalContent
            title={key[type?.progress || 'undefined']}
            progress
            headerActions={useAuthorDifferentMessage(author, postedBy, void 0)}
        />
    )
})
