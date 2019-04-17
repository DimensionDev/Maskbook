import { create, JSS } from 'jss'
import { jssPreset, createGenerateClassName } from '@material-ui/core/styles'
import JssProvider from 'react-jss/lib/JssProvider'
import ReactDOM from 'react-dom'
import { memoize } from 'lodash-es'
import React from 'react'
import { useMaskbookTheme } from './theme'
import ConstructableStylesheetsRendererGenerator from './ConstructableStylesheetsRenderer'

const DomRenderer = require('jss/lib/renderers/DomRenderer').default
const VirtualRenderer = require('jss/lib/renderers/VirtualRenderer').default
const sharedStyleSheets: StyleSheet[] = []
function update(shadow: ShadowRoot) {
    document.adoptedStyleSheets = [...sharedStyleSheets]
    shadow.adoptedStyleSheets = [...sharedStyleSheets]
}
const createJSS = memoize((shadow: ShadowRoot) => {
    const jss = create({ ...jssPreset() })
    update(shadow)
    ;(jss as any).options.Renderer = ConstructableStylesheetsRendererGenerator(shadow)
    //     attach(): void {
    //         const style = new CSSStyleSheet()
    //         ;(style as any).replaceSync(this._r.element.innerHTML)
    //         sharedStyleSheets.push(style)
    //         update(shadow)
    //         // super.attach()
    //         //     const e = this.element as HTMLStyleElement
    //         //     const sheet = new CSSStyleSheet()
    //         //     ;(sheet as any).replaceSync(e.innerText)
    //         //     sharedStyleSheets.push(sheet)
    //         //     update(shadow)
    //         //     // console.log('attach', (jss as any).id, head, this.element)
    //         //     // shadow.appendChild(head)
    //         //     // div.before(this.element)
    //         //     // shadow.appendChild(head)
    //     }
    // }
    console.log(jss)
    return jss
})
const generateClassName = createGenerateClassName()
/**
 *
 * @param node React Node
 * @param shadow ShadowRoot that want to inject to
 */
export function renderInShadowRoot(node: React.ReactNode, shadow: ShadowRoot) {
    const jss = createJSS(shadow)
    const main = shadow.querySelector('main') || document.createElement('main')
    shadow.appendChild(main)
    ReactDOM.render(
        <JssProvider jss={jss} generateClassName={generateClassName}>
            {useMaskbookTheme(node)}
        </JssProvider>,
        main as any,
    )
    return () => ReactDOM.unmountComponentAtNode(main as any)
}
