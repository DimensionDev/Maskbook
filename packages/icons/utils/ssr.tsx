import { createRequire } from 'module'
import { CacheProvider } from '@emotion/react'
import { IconPreview } from './previewer'
import { renderToString } from 'react-dom/server'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import * as General from '../general'
import * as Brands from '../brands'
import * as Plugins from '../plugins'
import * as Menus from '../menus'
import * as Settings from '../settings'

const require = createRequire(import.meta.url)
const createCache: typeof import('@emotion/cache').default = require('@emotion/cache')
const createEmotionServer: typeof import('@emotion/server/create-instance').default =
    require('@emotion/server/create-instance').default

const CSS = `
body {
    font-family: system-ui;
}
svg {
    outline: 1px solid red;
    margin: 0 6px;
}
.black {
    background: black;
}
`

// This file will output to ./dist/utils/ so target actually points to ../build.html
const target = resolve(fileURLToPath(import.meta.url), '../../../build.html')
console.log(target)
writeFileSync(target, render())
function render() {
    // @ts-ignore esm emit bug
    const cache = createCache.default({ key: 'css' })
    const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

    const html = renderToString(
        <CacheProvider value={cache}>
            <main id="brands">
                <IconPreview icons={Brands} title="Brands" />
            </main>
            <main id="general">
                <IconPreview icons={General} title="General" />
            </main>
            <main id="plugins">
                <IconPreview icons={Plugins} title="Plugins" />
            </main>
            <main id="menus">
                <IconPreview icons={Menus} title="Menus" />
            </main>
            <main id="settings">
                <IconPreview icons={Settings} title="Settings" />
            </main>
        </CacheProvider>,
    )
    const emotionChunks = extractCriticalToChunks(html)
    const emotionCss = constructStyleTagsFromChunks(emotionChunks)

    return renderFullPage(html, emotionCss)
}
function renderFullPage(html: string, css: string) {
    return `
<!DOCTYPE html>
    <html>
        <head>
            <meta char-set="UTF-8" />
            <title>Icons preview</title>
            <style>${CSS}</style>
            ${css}
            <meta name="viewport" content="initial-scale=1, width=device-width" />
        </head>
    <body>
        <main>${html}</main>
    </body>
</html>
`
}
