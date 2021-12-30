import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { NotSetupYetPrompt } from '../../shared/NotSetupYetPrompt'
import type { BannerProps } from '../../Welcomes/Banner'
import { DecryptFailedReason } from '../../../utils/constants'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
export interface DecryptPostFailedProps {
    error: Error
    AdditionalContentProps?: Partial<AdditionalContentProps>
    NotSetupYetPromptProps?: Partial<BannerProps>
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostFailed = memo(function DecryptPostFailed(props: DecryptPostFailedProps) {
    const { AdditionalContentProps, NotSetupYetPromptProps, author, postedBy, error } = props
    const { t } = useI18N()
    if (error?.message === DecryptFailedReason.MyCryptoKeyNotFound)
        return <NotSetupYetPrompt {...NotSetupYetPromptProps} description="decryptPostFailed" />
    return (
        <AdditionalContent
            title={t('service_decryption_failed')}
            titleIcon="error"
            message={error?.message}
            headerActions={wrapAuthorDifferentMessage(author, postedBy, void 0)}
            {...AdditionalContentProps}
        />
    )
})
