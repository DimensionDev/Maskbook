import { create } from 'jss'
import { createGenerateClassName, jssPreset, StylesProvider, ThemeProvider } from '@material-ui/styles'
import ReactDOM from 'react-dom'
import React from 'react'
import ConstructableStyleSheetsRenderer, {
    applyAdoptedStyleSheets,
    livingShadowRoots,
} from './ConstructableStyleSheetsRenderer'
import { getActivatedUI } from '../../social-network/ui'
import { geti18nContext } from '../i18n'
import { useValueRef } from '../hooks/useValueRef'
import { languageSettings } from '../../components/shared-settings/settings'

const jss = create({
    ...jssPreset(),
    Renderer: globalThis.location.hostname === 'localhost' ? undefined : (ConstructableStyleSheetsRenderer as any),
})
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
    const I18n = geti18nContext()
    const lang = useValueRef(languageSettings)
    return (
        <StylesProvider jss={jss} generateClassName={generateClassName}>
            <ThemeProvider theme={theme}>
                <I18n.Provider value={lang}>
                    <React.StrictMode>
                        <div {...props} />
                    </React.StrictMode>
                </I18n.Provider>
            </ThemeProvider>
        </StylesProvider>
    )
}
