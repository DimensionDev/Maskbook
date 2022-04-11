import React, { useEffect, useState } from 'react'
import { I18nextProvider, initReactI18next, type I18nextProviderProps } from 'react-i18next'
import { i18NextInstance } from '@masknet/shared-base'

initReactI18next.init(i18NextInstance)
export const I18NextProviderHMR =
    process.env.NODE_ENV === 'development'
        ? function I18NextProviderHMR({ i18n, defaultNS, children }: React.PropsWithChildren<I18nextProviderProps>) {
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
              // deliberately call it as a function in order to skip a React component nesting level.
              return I18nextProvider({
                  i18n,
                  defaultNS,
                  // @ts-expect-error react-18
                  children,
              })
          }
        : I18nextProvider
