import { Environment, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../../shared/flags'

let disconnected = false
export default function (signal: AbortSignal) {
    // Listen to API request from dashboard
    if (
        (process.env.NODE_ENV === 'development' || process.env.channel !== 'stable') &&
        process.env.architecture === 'web' &&
        process.env.engine === 'chromium'
    ) {
        WebExtensionMessage.acceptExternalConnect((conn) => {
            if (disconnected) return false
            console.log('New connection from', conn)
            if (!Flags.isolated_dashboard_bridge_enabled) return false
            if (!conn.url) return false
            /* cspell:disable-next-line */
            if (!new URL(conn.url).host.endsWith('compassionate-northcutt-326a3a.netlify.app')) return false
            return { acceptAs: Environment.HasBrowserAPI }
        })
    }
    signal.addEventListener('abort', () => (disconnected = true))
}
