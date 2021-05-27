import { Environment, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { newDashboardConnection } from '../../../settings/settings'

let disconnected = false
export default function () {
    // Listen to API request from dashboard
    if (
        (process.env.NODE_ENV === 'development' || process.env.build !== 'stable') &&
        process.env.architecture === 'web' &&
        process.env.target === 'chromium'
    ) {
        WebExtensionMessage.acceptExternalConnect((conn) => {
            if (disconnected) return false
            console.log('New connection from', conn)
            if (!newDashboardConnection.value) return false
            if (!conn.url) return false

            if (conn.url.startsWith('http://localhost:') || conn.url.startsWith('http://127.0.0.1:')) {
                return { acceptAs: Environment.HasBrowserAPI }
            }
            if (!new URL(conn.url).host.endsWith('compassionate-northcutt-326a3a.netlify.app')) return false
            return { acceptAs: Environment.HasBrowserAPI }
        })
    }
    return () => (disconnected = true)
}
