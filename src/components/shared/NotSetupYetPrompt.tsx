import React from 'react'
import { geti18nString } from '../../utils/i18n'
import { GetContext } from '@holoflows/kit/es'
import { getActivatedUI } from '../../social-network/ui'
import { Banner, BannerProps } from '../Welcomes/Banner'

export function NotSetupYetPrompt(props: Partial<BannerProps>) {
    return (
        <Banner
            title={geti18nString('service_not_setup_yet')}
            networkIdentifier={getActivatedUI()?.networkIdentifier}
            nextStep={
                GetContext() === 'options'
                    ? {
                          onClick: () => (location.hash = '/welcome'),
                      }
                    : undefined
            }
        />
    )
}
