import { create } from 'jss'
import { jssPreset, createGenerateClassName } from '@material-ui/styles'
import { JssProvider } from 'react-jss'
import ReactDOM from 'react-dom'
import { memoize } from 'lodash-es'
import React from 'react'
import { useMaskbookTheme } from '../theme'
import { ConstructableStyleSheetsRenderer } from './ConstructableStylesheetsRenderer'

const isPolyfilled = CSSStyleSheet.name !== 'CSSStyleSheet'
if (isPolyfilled) console.warn('Browser does not support Constructable Stylesheets. Using polyfill.')

const createJSS = memoize((shadow: ShadowRoot) => {
    return create({
        ...jssPreset(),
        Renderer: new ConstructableStyleSheetsRenderer(shadow),
    })
})
const generateClassName = createGenerateClassName()
/**
 *
 * @param node React Node
 * @param shadow ShadowRoot that want to inject to
 */
export function renderInShadowRoot(node: React.ReactNode, shadow: ShadowRoot) {
    const jss = createJSS(shadow)
    const jsx = (
        <JssProvider jss={jss} generateId={generateClassName}>
            {useMaskbookTheme(node)}
        </JssProvider>
    )
    const Component = class extends React.Component {
        state: { error?: Error } = { error: undefined }
        render() {
            if (this.state.error) return this.state.error.message
            return jsx
        }
        componentDidCatch(error: Error, errorInfo: any) {
            console.error(error, errorInfo)
            this.setState({ error })
        }
    }
    if (isPolyfilled) {
        const hostRoot = shadow.__polyfilled_root_ || document.createElement('host')
        shadow.__polyfilled_root_ = hostRoot
        shadow.appendChild(hostRoot)
        ReactDOM.render(<Component />, hostRoot)
        return () => ReactDOM.unmountComponentAtNode(hostRoot)
    } else {
        ReactDOM.render(<Component />, shadow as any)
        return () => ReactDOM.unmountComponentAtNode(shadow as any)
    }
}
