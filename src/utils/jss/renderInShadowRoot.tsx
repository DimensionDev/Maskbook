import { create } from 'jss'
import { createGenerateClassName, jssPreset, StylesProvider, ThemeProvider } from '@material-ui/styles'
import ReactDOM from 'react-dom'
import React from 'react'
import ConstructableStyleSheetsRenderer, {
    applyAdoptedStyleSheets,
    livingShadowRoots,
} from './ConstructableStyleSheetsRenderer'
import { getActivatedUI } from '../../social-network/ui'

const jss = create({ ...jssPreset(), Renderer: ConstructableStyleSheetsRenderer as any })
/**
 * Render the Node in the ShadowRoot
 * @param node React Node
 * @param shadow ShadowRoot that want to inject to
 */
export function renderInShadowRoot(node: React.ReactNode, shadow: ShadowRoot) {
    if (shadow.mode === 'open') console.warn('Do not render with open ShadowRoot!')
    ReactDOM.render(<RenderInShadowRootWrapper children={node} />, shadow as any)
    livingShadowRoots.add(shadow)
    applyAdoptedStyleSheets()
    return () => {
        shadow.adoptedStyleSheets = []
        ReactDOM.unmountComponentAtNode(shadow as any)
        livingShadowRoots.delete(shadow)
    }
}

const generateClassName = createGenerateClassName()
export class RenderInShadowRootWrapper extends React.PureComponent {
    state: { error?: Error } = { error: undefined }
    render() {
        if (this.state.error) return <pre style={{ whiteSpace: 'break-spaces' }}>{this.state.error.message}</pre>
        return <Maskbook children={this.props.children} />
    }
    componentDidCatch(error: Error) {
        this.setState({ error })
    }
}

function Maskbook(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    const theme = getActivatedUI().useTheme()
    return (
        <StylesProvider jss={jss} generateClassName={generateClassName}>
            <ThemeProvider theme={theme}>
                <React.StrictMode>
                    <div {...props} />
                </React.StrictMode>
            </ThemeProvider>
        </StylesProvider>
    )
}
