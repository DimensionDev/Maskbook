// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { initReactI18next } from 'react-i18next'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { i18NextInstance, updateLanguage, PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { once, noop } from 'lodash-es'
import { DisableShadowRootContext, MaskThemeProvider } from '@masknet/theme'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import { addShareBaseI18N } from '@masknet/shared-base-ui'
import { addMaskI18N } from '../../../shared-ui/locales/languages.js'
import type { PopupSSR_Props } from '../../../background/tasks/Cancellable/PopupSSR/type.js'
import { PersonaHomeUI } from './pages/Personas/Home/UI.js'
import { usePopupTheme } from '../../utils/theme/usePopupTheme.js'
import { PopupLayout } from './components/PopupLayout/index.js'

const init = once(() =>
    i18NextInstance.init().then(() => {
        addMaskI18N(i18NextInstance)
        addShareBaseI18N(i18NextInstance)
        initReactI18next.init(i18NextInstance)
    }),
)
export async function render(props: PopupSSR_Props) {
    if (Object.keys(props).length === 0) throw new Error('PopupSSR: props is empty')

    await init()
    updateLanguage(props.language)
    // https://github.com/emotion-js/emotion/issues/2933
    const cache = (createCache.default || createCache)({ key: 'css' })
    const server = (createEmotionServer.default || createEmotionServer)(cache)

    const html = renderToString(
        <CacheProvider value={cache}>
            <PopupSSR {...props} />
        </CacheProvider>,
    )
        .replaceAll('href="/', 'href="#/')
        .replaceAll('href="#/dashboard', 'href="/dashboard')
    const css = server.constructStyleTagsFromChunks(server.extractCriticalToChunks(html))
    return { html, css }
}

function PopupSSR(props: PopupSSR_Props) {
    return (
        // MaskUIRoot
        <DisableShadowRootContext.Provider value>
            <StaticRouter location={PopupRoutes.Personas}>
                <MaskThemeProvider
                    useTheme={usePopupTheme}
                    CustomSnackbarOffsetY={0}
                    useMaskIconPalette={() => 'light'}>
                    <PopupLayout>
                        <PersonaHomeUI
                            accounts={props.accounts ?? EMPTY_LIST}
                            networks={props.networks}
                            onRestore={noop}
                            onCreatePersona={noop}
                            onConnect={noop}
                            onAccountClick={noop}
                            avatar={props.avatar}
                            publicKey={props.currentPublicKeyHex}
                            fingerprint={props.currentFingerPrint}
                            isEmpty={!props.hasPersona}
                            nickname={props.nickname}
                        />
                    </PopupLayout>
                </MaskThemeProvider>
            </StaticRouter>
        </DisableShadowRootContext.Provider>
    )
}
