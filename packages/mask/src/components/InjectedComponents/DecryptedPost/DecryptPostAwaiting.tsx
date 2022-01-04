import { memo, useState } from 'react'
import { ShadowRootTooltip, useI18N } from '../../../utils'
import { AdditionalContent } from '../AdditionalPostContent'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { DecryptIntermediateProgress, DecryptIntermediateProgressKind } from '@masknet/encryption'
import { useTimeout } from 'react-use'
import { Typography } from '@mui/material'
export interface DecryptPostAwaitingProps {
    progress?: DecryptIntermediateProgress
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { author, postedBy, progress: type } = props
    const { t } = useI18N()

    const [isReady] = useTimeout(5000)

    let text = t('decrypted_postbox_decrypting')
    if (type?.event === DecryptIntermediateProgressKind.TryDecryptByE2E) {
        text = t('decrypted_postbox_decrypting_finding_post_key')
        if (isReady()) text = t('decrypted_postbox_decrypting_finding_post_key_long')
    }
    // unused
    t('decrypted_postbox_decrypting_finding_person_key')

    const header = wrapAuthorDifferentMessage(
        author,
        postedBy,
        <ShadowRootTooltip title="If this post is not shared with you, it will be like this.">
            <Typography variant="caption">Can't decrypt?</Typography>
        </ShadowRootTooltip>,
    )
    const shouldShowProgress = type?.event !== DecryptIntermediateProgressKind.TryDecryptByE2E || !isReady()
    return <AdditionalContent title={text} progress={shouldShowProgress} headerActions={header} />
})
