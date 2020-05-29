import React from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useI18N } from '../../../utils/i18n-next-ui'
import { NotSetupYetPrompt } from '../../shared/NotSetupYetPrompt'
import type { BannerProps } from '../../Welcomes/Banner'
import { DecryptFailedReason } from '../../../utils/constants'
export interface DecryptPostFailedProps {
    error: Error
    AdditionalContentProps?: Partial<AdditionalContentProps>
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export const DecryptPostFailed = React.memo(function DecryptPostFailed({ error, ...props }: DecryptPostFailedProps) {
    const { t } = useI18N()
    if (error && error.message === DecryptFailedReason.MyCryptoKeyNotFound) {
        return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    }
    return (
        <AdditionalContent
            title={t('service_decryption_failed')}
            titleIcon="error"
            message={error?.message}
            {...props.AdditionalContentProps}
        />
    )
})
