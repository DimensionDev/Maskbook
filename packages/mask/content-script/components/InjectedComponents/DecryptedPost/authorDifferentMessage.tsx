import type { ProfileIdentifier } from '@masknet/shared-base'
import { Trans } from '@lingui/react/macro'

export function useAuthorDifferentMessage(
    author: ProfileIdentifier | null,
    postBy: ProfileIdentifier | null,
    jsx: React.ReactNode,
) {
    if (!author || !postBy) return jsx
    if (author === postBy) return jsx
    return (
        <>
            <Trans>Originally posted by {author.userId}</Trans>
            {jsx}
        </>
    )
}
