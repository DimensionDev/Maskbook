import ReactDOM from 'react-dom'
import { ErrorBoundary } from '../components/shared/ErrorBoundary'
import { NoEffectUsePortalShadowRootContext } from '@masknet/theme'

export function createNormalReactRoot(jsx: JSX.Element, container?: HTMLElement) {
    if (!container) container = document.getElementById('root') ?? void 0
    if (!container) {
        container = document.createElement('div')
        document.body.appendChild(container)
    }

    if (process.env.NODE_ENV === 'development') {
        // Make the document cleaner
        setTimeout(() => [...document.querySelectorAll('script')].forEach((x) => x.remove()), 200)
    }

    return ReactDOM.createRoot(container).render(
        <NoEffectUsePortalShadowRootContext.Provider value>
            <ErrorBoundary>{jsx}</ErrorBoundary>
        </NoEffectUsePortalShadowRootContext.Provider>,
    )
}
