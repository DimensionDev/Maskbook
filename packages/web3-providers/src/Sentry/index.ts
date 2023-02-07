import { NetworkPluginID, getSiteType } from '@masknet/shared-base'
import type { LoggerAPI } from '../types/Logger.js'
import type { Event } from '@sentry/browser'

export class SentryAPI implements LoggerAPI.Provider<Event, Error> {
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

    createEvent(options: LoggerAPI.EventOptions): Event {
        return {
            event_id: options.eventID,
            message: 'An Event Message',
            platform: 'twitter.com',
        }
    }
    createException(options: LoggerAPI.ExceptionOptions): Error {
        return options.error ?? new Error('Something went wrong!')
    }

    // private createScope(options?: ScopeOp) {
    //     const scope = new Sentry.Scope()

    //     if (this.id) scope.setTag('id', this.id)
    //     if (this.site) scope.setTag('site_id', this.site)
    //     if (this.pluginID) scope.setTag('plugin_id', this.pluginID)

    //     return scope
    // }

    captureEvent(options: LoggerAPI.EventOptions) {
        Sentry.captureEvent(this.createEvent(options))
    }

    captureException(options: LoggerAPI.ExceptionOptions) {
        Sentry.captureException(this.createException(options), {
            tags: {
                pageID: 'index',
                pluginID: NetworkPluginID.PLUGIN_SOLANA,
            },
        })
    }

    captureMessage(message: string) {
        Sentry.captureMessage(message, {
            tags: {
                pageID: 'index',
                pluginID: NetworkPluginID.PLUGIN_EVM,
            },
        })
    }
}
