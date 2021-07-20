import { IconPreview } from './previewer'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/styles'
import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import * as General from '../general'
import * as Brands from '../brands'

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
    const css = new ServerStyleSheets()
    const html = renderToStaticMarkup(
        css.collect(
            <html lang="en">
                <head>
                    <meta charSet="UTF-8" />
                    <title>Icons preview</title>
                    <style>$$style_here$$</style>
                    <style>{CSS}</style>
                </head>
                <body>
                    <main id="brands">
                        <IconPreview icons={Brands} title="Brands" />
                    </main>
                    <main id="general">
                        <IconPreview icons={General} title="General" />
                    </main>
                </body>
            </html>,
        ),
    )
    return '<!DOCTYPE html>' + html.replace('$$style__here$$', css.toString())
}
