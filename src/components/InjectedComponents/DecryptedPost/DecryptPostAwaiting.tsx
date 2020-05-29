import React from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { DecryptionProgress } from '../../../extension/background-script/CryptoServices/decryptFrom'
export interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    AdditionalContentProps?: Partial<AdditionalContentProps>
}
export const DecryptPostAwaiting = React.memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { t } = useI18N()
    const key = {
        finding_post_key: t('decrypted_postbox_decrypting_finding_post_key'),
        finding_person_public_key: t('decrypted_postbox_decrypting_finding_person_key'),
        init: t('decrypted_postbox_decrypting'),
        undefined: t('decrypted_postbox_decrypting'),
    } as const
    return (
        <AdditionalContent
            title={key[(props.type && props.type.progress) || 'undefined']}
            progress
            {...props.AdditionalContentProps}
        />
    )
})
