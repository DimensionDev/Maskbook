import { Environment, WebExtensionMessage } from '@dimensiondev/holoflows-kit'

let disconnected = false
export default function () {
    // Listen to API request from dashboard
    if (
        process.env.NODE_ENV === 'development' &&
        process.env.architecture === 'web' &&
        process.env.target === 'chromium'
    ) {
        WebExtensionMessage.acceptExternalConnect((conn) => {
            if (disconnected) return false
            console.log('New connection from', conn)
            return {
                acceptAs: Environment.HasBrowserAPI,
            }
        })
    }
    return () => (disconnected = true)
}
