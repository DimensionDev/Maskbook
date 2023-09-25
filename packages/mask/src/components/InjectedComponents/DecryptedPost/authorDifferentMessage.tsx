import type { ProfileIdentifier } from '@masknet/shared-base'
import { useMaskSharedI18N } from '../../../../shared-ui/index.js'

export function useAuthorDifferentMessage(
    author: ProfileIdentifier | null,
    postBy: ProfileIdentifier | null,
    jsx: React.ReactNode,
) {
    const t = useMaskSharedI18N()
    if (!author || !postBy) return jsx
    if (author === postBy) return jsx
    return (
        <>
            {t.decrypted_postbox_author_mismatch({ name: author?.userId })}
            {jsx}
        </>
    )
}
