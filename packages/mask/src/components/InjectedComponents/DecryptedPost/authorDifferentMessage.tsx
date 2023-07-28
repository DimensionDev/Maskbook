import { useMaskI18N } from '../../../../shared-ui/index.js'
import type { ProfileIdentifier } from '@masknet/shared-base'

export function useAuthorDifferentMessage(
    author: ProfileIdentifier | null,
    postBy: ProfileIdentifier | null,
    jsx: React.ReactNode,
) {
    const t = useMaskI18N()
    if (!author || !postBy) return jsx
    if (author === postBy) return jsx
    return (
        <>
            {t.decrypted_postbox_author_mismatch({ name: author?.userId })}
            {jsx}
        </>
    )
}
