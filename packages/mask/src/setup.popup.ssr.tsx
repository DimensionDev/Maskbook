import { i18NextInstance } from '@masknet/shared-base'
import { once } from 'lodash-unified'
import { TssCacheProvider } from '@masknet/theme'
import { CacheProvider } from '@emotion/react'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import { initReactI18next } from 'react-i18next'
import { addMaskI18N } from '../shared-ui/locales/languages'
import type { PopupSSR_Props } from '../background/tasks/Cancellable/PopupSSR/type'
import { PopupSSR } from './PopupSSR_Root'

const init = once(() =>
    i18NextInstance.init().then(() => {
        addMaskI18N(i18NextInstance)
        initReactI18next.init(i18NextInstance)
    }),
)
export async function render(props: PopupSSR_Props) {
    await init()
    const muiCache = createCache({ key: 'css' })
    const tssCache = createCache({ key: 'tss' })
    const tssServer = createEmotionServer(tssCache)
    const muiServer = createEmotionServer(muiCache)

    const html = renderToString(
        <CacheProvider value={muiCache}>
            <TssCacheProvider value={tssCache}>
                <PopupSSR {...props} />
            </TssCacheProvider>
        </CacheProvider>,
    ).replaceAll('href="/', 'href="#/')
    const muiCSS = muiServer.constructStyleTagsFromChunks(muiServer.extractCriticalToChunks(html))
    const tssCSS = tssServer.constructStyleTagsFromChunks(tssServer.extractCriticalToChunks(html))
    return { html, css: muiCSS + tssCSS }
}
