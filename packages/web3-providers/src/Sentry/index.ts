import { NetworkPluginID, getSiteType } from '@masknet/shared-base'
import type { LoggerAPI } from '../types/Logger.js'

class Logger implements LoggerAPI.Logger {
    constructor() {
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

    private createScope(options?: ScopeOp) {
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

export class SentryLoggerAPI implements LoggerAPI.Provider {
    createLogger() {
        return new Logger()
    }
}
