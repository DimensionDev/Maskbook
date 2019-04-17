import { create } from 'jss'
import { jssPreset, createGenerateClassName } from '@material-ui/core/styles'
import JssProvider from 'react-jss/lib/JssProvider'
import ReactDOM from 'react-dom'
import { memoize } from 'lodash-es'
import React from 'react'
import { useMaskbookTheme } from './theme'
import ConstructableStylesheetsRendererGenerator from './ConstructableStylesheetsRenderer'

const createJSS = memoize((shadow: ShadowRoot) => {
    const jss = create({ ...jssPreset() })
    ;(jss as any).options.Renderer = ConstructableStylesheetsRendererGenerator(shadow)
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
    ReactDOM.render(
        <JssProvider jss={jss} generateClassName={generateClassName}>
            {useMaskbookTheme(node)}
        </JssProvider>,
        shadow as any,
    )
    return () => ReactDOM.unmountComponentAtNode(shadow as any)
}
