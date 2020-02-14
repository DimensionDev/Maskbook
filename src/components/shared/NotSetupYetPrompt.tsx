import React from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import { Banner, BannerProps } from '../Welcomes/Banner'

export function NotSetupYetPrompt(props: Partial<BannerProps>) {
    const { t } = useI18N()
    return <Banner title={t('service_not_setup_yet')} close="hidden" {...props} />
}
