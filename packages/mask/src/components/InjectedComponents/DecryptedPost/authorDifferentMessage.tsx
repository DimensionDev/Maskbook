import type { ProfileIdentifier } from '@masknet/shared-base'
import { i18n } from '../../../../shared-ui/locales_legacy'

export function wrapAuthorDifferentMessage(
    author: ProfileIdentifier | null,
    postBy: ProfileIdentifier | null,
    jsx: React.ReactNode,
) {
    if (!author || !postBy) return jsx
    if (author === postBy) return jsx
    return (
        <>
            {i18n.t('decrypted_postbox_author_mismatch', { name: author?.userId })}
            {jsx}
        </>
    )
}
