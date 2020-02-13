import React from 'react'
import { Banner, BannerProps } from '../Welcomes/Banner'

export function NotSetupYetPrompt(props: Partial<BannerProps>) {
    return <Banner close="hidden" {...props} />
}
