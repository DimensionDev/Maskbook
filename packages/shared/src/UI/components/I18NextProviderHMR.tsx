import React, { PropsWithChildren, useEffect, useState } from 'react'
import { I18nextProvider, initReactI18next, type I18nextProviderProps } from 'react-i18next'
import { i18NextInstance } from '@masknet/shared-base'

initReactI18next.init(i18NextInstance)
export function I18NextProviderHMR(props: PropsWithChildren<I18nextProviderProps>): JSX.Element {
    return I18nextProvider(props) as any
}

function I18NextProvider_dev({ i18n, defaultNS, children }: React.PropsWithChildren<I18nextProviderProps>) {
    const [ns, setNS] = useState(defaultNS)

    useEffect(() => {
        const f = () => setNS('HMR')
        globalThis.addEventListener('MASK_I18N_HMR', f)
        return () => globalThis.removeEventListener('MASK_I18N_HMR', f)
    }, [])
    // Force trigger a re-render to apply HMR
    if (ns === 'HMR') defaultNS = Math.random() + ''

    useEffect(() => {
        if (ns === 'HMR') setNS('')
    }, [ns])
    return I18nextProvider({
        i18n,
        defaultNS,
        children,
    })
}

// @ts-expect-error
if (process.env.NODE_ENV === 'development') I18NextProviderHMR = I18NextProvider_dev
// @ts-expect-error
else I18NextProviderHMR = I18nextProvider
