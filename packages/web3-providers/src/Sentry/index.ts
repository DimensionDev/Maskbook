import type { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import type { LogHubBaseAPI } from '../types/LogHub.js'

class Logger implements LogHubBaseAPI.Logger {
    constructor(
        private platform: LogHubBaseAPI.Platform | EnhanceableSite,
        private loggerId: string,
        private pluginID?: NetworkPluginID,
    ) {
        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            defaultIntegrations: false,
            integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
            environment: process.env.NODE_ENV,
            release: process.env.VERSION,
            tracesSampleRate: 1.0,
        })
    }

    private initScope() {
        const scope = new Sentry.Scope()
        scope.setTag('platform', this.platform)

        if (this.loggerId) scope.setUser({ id: this.loggerId })
        if (this.pluginID) scope.setTag('plugin_id', this.pluginID)

        return scope
    }

    public captureException(error: Error): void {
        const scope = this.initScope()
        Sentry.captureException(error, scope)
    }

    public captureMessage(message: string | object): void {
        const scope = this.initScope()
        Sentry.captureMessage(message, scope)
    }
}

export class LogHubAPI implements LogHubBaseAPI.Provider {
    createLogger(
        platform: LogHubBaseAPI.Platform | EnhanceableSite,
        id: string,
        pluginID?: NetworkPluginID | undefined,
    ): LogHubBaseAPI.Logger {
        return new Logger(platform, id, pluginID)
    }
}
