import React, { type JSX } from 'react'
import { I18nProvider, type I18nProviderProps } from '@lingui/react'

export const LinguiProviderHMR = process.env.NODE_ENV === 'development' ? LinguiProviderDev : I18nProvider

function LinguiProviderDev({ i18n, children }: React.PropsWithChildren<I18nProviderProps>): JSX.Element {
    // TODO: support HMR
    return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
