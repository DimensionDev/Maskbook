import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent } from '../AdditionalPostContent'
import { ErrorReasons } from '@masknet/encryption'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import MaskPluginWrapper from '../../../plugins/MaskPluginWrapper'

export interface DecryptPostFailedProps {
    error: Error
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostFailed = memo(function DecryptPostFailed(props: DecryptPostFailedProps) {
    const { author, postedBy, error } = props
    const { t } = useI18N()

    if (error?.message === ErrorReasons.CurrentProfileDoesNotConnectedToPersona) {
        return <MaskPluginWrapper pluginName="" />
    }
    return (
        <AdditionalContent
            title={t('service_decryption_failed')}
            titleIcon="error"
            message={error?.message}
            headerActions={wrapAuthorDifferentMessage(author, postedBy, void 0)}
        />
    )
})
