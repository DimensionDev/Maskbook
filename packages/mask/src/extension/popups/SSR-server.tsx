// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { Suspense } from 'react'
import { i18NextInstance, updateLanguage, PopupRoutes } from '@masknet/shared-base'
import { once, noop } from 'lodash-es'
import { TssCacheProvider, MaskThemeProvider } from '@masknet/theme'
import { CacheProvider } from '@emotion/react'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import { initReactI18next } from 'react-i18next'
import { addMaskI18N } from '../../../shared-ui/locales/languages.js'
import type { PopupSSR_Props } from '../../../background/tasks/Cancellable/PopupSSR/type.js'
import { StaticRouter } from 'react-router-dom/server.js'
import { PopupFrame } from './components/PopupFrame/index.js'
import { PersonaHomeUI } from './pages/Personas/Home/UI.js'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme.js'
import { PersonaHeaderUI } from './pages/Personas/components/PersonaHeader/UI.js'
import { NormalHeader } from './components/NormalHeader/index.js'
import { addShareBaseI18N } from '@masknet/shared-base-ui'

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
    const muiCache = (createCache.default || createCache)({ key: 'css' })
    const tssCache = (createCache.default || createCache)({ key: 'tss' })
    const tssServer = (createEmotionServer.default || createEmotionServer)(tssCache)
    const muiServer = (createEmotionServer.default || createEmotionServer)(muiCache)

    const html = renderToString(
        <CacheProvider value={muiCache}>
            <TssCacheProvider value={tssCache}>
                <PopupSSR {...props} />
            </TssCacheProvider>
        </CacheProvider>,
    )
        .replaceAll('href="/', 'href="#/')
        .replaceAll('href="#/dashboard', 'href="/dashboard')
    const muiCSS = muiServer.constructStyleTagsFromChunks(muiServer.extractCriticalToChunks(html))
    const tssCSS = tssServer.constructStyleTagsFromChunks(tssServer.extractCriticalToChunks(html))
    return { html, css: muiCSS + tssCSS }
}

function PopupSSR(props: PopupSSR_Props) {
    function useTheme() {
        return usePopupFullPageTheme(props.language)
    }
    return (
        // MaskUIRoot
        <Suspense fallback={null}>
            <Suspense fallback={null}>
                <StaticRouter location={PopupRoutes.Personas}>
                    <MaskThemeProvider useTheme={useTheme} CustomSnackbarOffsetY={0} useMaskIconPalette={() => 'light'}>
                        <PopupFrame>
                            {/* Persona */}
                            <Suspense fallback={null}>
                                {props.hasPersona ? (
                                    <PersonaHeaderUI
                                        isSelectPersonaPage={false}
                                        onActionClick={noop}
                                        avatar={props.avatar}
                                        fingerprint={props.currentFingerPrint || ''}
                                        nickname={props.nickname}
                                    />
                                ) : (
                                    <NormalHeader onClose={noop} />
                                )}
                                <PersonaHomeUI
                                    fetchProofsLoading
                                    onEdit={noop}
                                    onRestore={noop}
                                    onCreatePersona={noop}
                                    avatar={props.avatar}
                                    fingerprint={props.currentFingerPrint || ''}
                                    isEmpty={!props.hasPersona}
                                    nickname={props.nickname}
                                    accountsCount={props.linkedProfilesCount}
                                    walletsCount={0}
                                />
                            </Suspense>
                        </PopupFrame>
                    </MaskThemeProvider>
                </StaticRouter>
            </Suspense>
        </Suspense>
    )
}
