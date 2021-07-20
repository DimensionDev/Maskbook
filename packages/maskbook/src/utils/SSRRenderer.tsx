import ReactDOM from 'react-dom'
import { ErrorBoundary } from '../components/shared/ErrorBoundary'

export async function SSRRenderer(jsx: JSX.Element, container?: HTMLElement) {
    if (typeof window === 'object') {
        if (!container) container = document.getElementById('root') ?? void 0
        if (!container) {
            container = document.createElement('div')
            document.body.appendChild(container)
        }
        const oldChildren = [...container.children]
        ReactDOM.createRoot(container).render(<ErrorBoundary>{jsx}</ErrorBoundary>)
        oldChildren.forEach((x) => x.remove())
        if (process.env.NODE_ENV === 'development') {
            setTimeout(() => [...document.querySelectorAll('script')].forEach((x) => x.remove()), 200)
        }
        return ''
    } else {
        const Server = await import('react-dom/server')
        const { ServerStyleSheets } = await import('@material-ui/styles')
        const sheets = new ServerStyleSheets()
        const html = Server.renderToString(sheets.collect(jsx))
        const styles = sheets.toString()
        return `<style>${styles}</style><div id="root">${html}</div>`
    }
}
