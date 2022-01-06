import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent } from '../AdditionalPostContent'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { DecryptIntermediateProgressKind, DecryptIntermediateProgress } from '@masknet/encryption'
import { useTimeout } from 'react-use'
export interface DecryptPostAwaitingProps {
    type?: DecryptIntermediateProgress
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { author, postedBy, type } = props
    const { t } = useI18N()

    const [isReady] = useTimeout(5000)

    let text = t('decrypted_postbox_decrypting')
    if (type?.event === DecryptIntermediateProgressKind.TryDecryptByE2E) {
        text = t('decrypted_postbox_decrypting_finding_post_key')
        if (isReady()) text = t('decrypted_postbox_decrypting_finding_post_key_long')
    }

    const shouldShowProgress = type?.event !== DecryptIntermediateProgressKind.TryDecryptByE2E || !isReady()
    return (
        <AdditionalContent
            title={text}
            progress={shouldShowProgress}
            headerActions={wrapAuthorDifferentMessage(author, postedBy, undefined)}
        />
    )
})
