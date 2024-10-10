import { memo } from 'react'
import { AdditionalContent } from '../AdditionalPostContent.js'
import type { DecryptionProgress } from './types.js'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { useAuthorDifferentMessage } from './authorDifferentMessage.js'
import { Select } from '@lingui/macro'
interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
}
export const DecryptPostAwaiting = memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { author, postedBy, type } = props
    const decryptProgress = type?.progress
    return (
        <AdditionalContent
            title={
                <Select
                    value={decryptProgress}
                    _finding_post_key="Mask is finding the key to decrypt this message. If this last for a long time, this post might not be shared to you."
                    _finding_person_public_key="Mask is looking for the public key of the author..."
                    _other="Mask is decrypting..."
                />
            }
            progress
            headerActions={useAuthorDifferentMessage(author, postedBy, void 0)}
        />
    )
})
