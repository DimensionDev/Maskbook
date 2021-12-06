import { Identifier, ProfileIdentifier } from '../../../database/type'
import { i18n } from '../../../../shared-ui/locales_legacy'

type T = ProfileIdentifier | undefined
export function wrapAuthorDifferentMessage(author: T, postBy: T, jsx: React.ReactNode) {
    if (!author?.userId) return jsx
    if (author?.isUnknown || postBy?.isUnknown) return jsx
    if (Identifier.equals(author, postBy)) return jsx
    return (
        <>
            {i18n.t('decrypted_postbox_author_mismatch', { name: author?.userId })}
            {jsx}
        </>
    )
}
