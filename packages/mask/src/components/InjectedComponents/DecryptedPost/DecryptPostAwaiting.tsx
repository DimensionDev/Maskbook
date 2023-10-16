import { memo } from 'react'
import { useMaskSharedTrans } from '../../../utils/index.js'
import { AdditionalContent } from '../AdditionalPostContent.js'
import type { DecryptionProgress } from './types.js'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { useAuthorDifferentMessage } from './authorDifferentMessage.js'
interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { author, postedBy, type } = props
    const { t } = useMaskSharedTrans()
    const key = {
        finding_post_key: t('decrypted_postbox_decrypting_finding_post_key'),
        finding_person_public_key: t('decrypted_postbox_decrypting_finding_person_key'),
        init: t('decrypted_postbox_decrypting'),
        decode_post: t('decrypted_postbox_decoding'),
        iv_decrypted: t('decrypted_postbox_decoding'),
        payload_decrypted: t('decrypted_postbox_decoding'),
        intermediate_success: 'unreachable case. it should display success UI',
        undefined: t('decrypted_postbox_decrypting'),
    } as const
    return (
        <AdditionalContent
            title={key[type?.progress || 'undefined']}
            progress
            headerActions={useAuthorDifferentMessage(author, postedBy, void 0)}
        />
    )
})
