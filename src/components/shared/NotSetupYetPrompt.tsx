import React from 'react'
import { geti18nString } from '../../utils/i18n'
import { Banner, BannerProps } from '../Welcomes/Banner'

export function NotSetupYetPrompt(props: Partial<BannerProps>) {
    return <Banner title={geti18nString('service_not_setup_yet')} close="hidden" {...props} />
}
