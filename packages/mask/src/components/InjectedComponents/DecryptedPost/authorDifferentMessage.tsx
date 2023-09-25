import type { ProfileIdentifier } from '@masknet/shared-base'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'

export function useAuthorDifferentMessage(
    author: ProfileIdentifier | null,
    postBy: ProfileIdentifier | null,
    jsx: React.ReactNode,
) {
    const t = useMaskSharedTrans()
    if (!author || !postBy) return jsx
    if (author === postBy) return jsx
    return (
        <>
            {t.decrypted_postbox_author_mismatch({ name: author?.userId })}
            {jsx}
        </>
    )
}
