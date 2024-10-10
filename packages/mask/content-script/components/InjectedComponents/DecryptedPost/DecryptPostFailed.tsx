import { memo } from 'react'
import { AdditionalContent } from '../AdditionalPostContent.js'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { useAuthorDifferentMessage } from './authorDifferentMessage.js'
import { Trans } from '@lingui/macro'

interface DecryptPostFailedProps {
    error: Error
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
}
export const DecryptPostFailed = memo(function DecryptPostFailed(props: DecryptPostFailedProps) {
    const { author, postedBy, error } = props

    return (
        <AdditionalContent
            title={<Trans>Failed to decrypt.</Trans>}
            titleIcon="error"
            message={error.message}
            headerActions={useAuthorDifferentMessage(author, postedBy, void 0)}
        />
    )
})
