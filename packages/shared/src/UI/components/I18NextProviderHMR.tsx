import React, { useEffect, useState } from 'react'
import { I18nextProvider, type I18nextProviderProps } from 'react-i18next'

export function I18NextProviderHMR({ i18n, defaultNS, children }: React.PropsWithChildren<I18nextProviderProps>) {
    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [ns, setNS] = useState(defaultNS)
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const f = () => setNS('HMR')
            globalThis.addEventListener('MASK_I18N_HMR', f)
            return () => globalThis.removeEventListener('MASK_I18N_HMR', f)
        }, [])

        // Force trigger a re-render to apply HMR
        if (ns === 'HMR') defaultNS = Math.random() + ''

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (ns === 'HMR') setNS('')
        }, [ns])
    }
    // deliberately call it as a function in order to skip a React component nesting level.
    return I18nextProvider({
        i18n,
        defaultNS,
        children,
    })
}
