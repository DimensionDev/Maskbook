import ReactDOM from 'react-dom'
import React from 'react'

export function SSRRenderer(jsx: JSX.Element, container?: HTMLElement) {
    if (typeof window === 'object') {
        if (!container) container = document.getElementById('root')!
        if (!container) {
            container = document.createElement('div')
            document.body.appendChild(container)
        }
        ReactDOM.createRoot(container).render(React.createElement(React.StrictMode, {}, jsx))
    } else {
        async function render() {
            const Server = await import('react-dom/server')
            const ServerStyleSheets = await import('@material-ui/styles/ServerStyleSheets')
            const sheets = new ServerStyleSheets.default()
            const html = Server.renderToString(sheets.collect(jsx))
            const styles = sheets.toString()
            return `<style>${styles}</style><div id="root">${html}</div>`
        }
        render()
            .then(console.log)
            .then(() => process.exit())
    }
}
