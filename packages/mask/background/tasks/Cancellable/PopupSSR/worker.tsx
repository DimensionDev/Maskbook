// I'm a WebWorker!

import './worker_patch'
// @ts-ignore
import { PopupSSR } from './loader'
import { renderToString } from 'react-dom/server'
// @ts-ignore
import createCache from '@emotion/cache/dist/emotion-cache.cjs.prod.js'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
// TODO:
import { TssCacheProvider } from '../../../../../theme/node_modules/tss-react'

export async function main(): Promise<{ html: string; css: string }> {
    return render()
}

function serverCache(key: string) {
    const cache = createCache({ key })
    return cache
}
function render() {
    debugger
    const muiCache = serverCache('mui')
    const tssCache = serverCache('tss')
    const tssServer = createEmotionServer(tssCache)
    const muiServer = createEmotionServer(muiCache)

    const html = renderToString(
        <CacheProvider value={muiCache}>
            <TssCacheProvider value={tssCache}>
                <PopupSSR />
            </TssCacheProvider>
        </CacheProvider>,
    )
    const muiCSS = muiServer.constructStyleTagsFromChunks(muiServer.extractCriticalToChunks(html))
    const tssCSS = tssServer.constructStyleTagsFromChunks(tssServer.extractCriticalToChunks(html))
    return { html, css: muiCSS + tssCSS }
}
