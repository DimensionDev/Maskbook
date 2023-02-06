import { NetworkPluginID, getSiteType } from '@masknet/shared-base'
import type { LogHubBaseAPI } from '../types/LogHub.js'

class Logger implements LogHubBaseAPI.Logger {
    constructor(private id: string, private pluginID?: NetworkPluginID) {
        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            defaultIntegrations: false,
            integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
            environment: process.env.NODE_ENV,
            release: process.env.VERSION,
            tracesSampleRate: 1.0,
        })
    }

    private get site() {
        return getSiteType()
    }

    private createScope() {
        const scope = new Sentry.Scope()

        if (this.id) scope.setTag('id', this.id)
        if (this.site) scope.setTag('site_id', this.site)
        if (this.pluginID) scope.setTag('plugin_id', this.pluginID)

        return scope
    }

    public captureException(error: Error): void {
        const scope = this.createScope()
        Sentry.captureException(error, scope)
        Sentry.captureEvent
    }

    public captureMessage(message: string): void {
        const scope = this.createScope()
        Sentry.captureMessage(message, scope)
    }
}

export class LogHubAPI implements LogHubBaseAPI.Provider {
    createLogger(id: string, pluginID?: NetworkPluginID): LogHubBaseAPI.Logger {
        return new Logger(id, pluginID)
    }
}
