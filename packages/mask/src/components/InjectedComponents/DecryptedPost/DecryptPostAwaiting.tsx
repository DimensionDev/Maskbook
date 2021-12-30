import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import type { DecryptionProgress } from '../../../extension/background-script/CryptoServices/decryptFrom'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
export interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    AdditionalContentProps?: Partial<AdditionalContentProps>
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { AdditionalContentProps, author, postedBy, type } = props
    const { t } = useI18N()
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
            headerActions={wrapAuthorDifferentMessage(author, postedBy, void 0)}
            {...AdditionalContentProps}
        />
    )
})
