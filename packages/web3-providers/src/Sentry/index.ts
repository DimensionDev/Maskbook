import type { Event } from '@sentry/browser'
import { getSiteType, isOpera, isFirefox, isEdge, isChromium } from '@masknet/shared-base'
import { LoggerAPI } from '../types/Logger.js'

export class SentryAPI implements LoggerAPI.Provider<Event, Event> {
    constructor() {
        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            defaultIntegrations: false,
            integrations: [],
            environment: process.env.NODE_ENV,
            tracesSampleRate: 1.0,
        })
    }

    private get site() {
        return getSiteType()
    }

    private get agent() {
        if (isEdge()) return 'edge'
        if (isOpera()) return 'opera'
        if (isFirefox()) return 'firefox'
        if (isChromium()) return 'chromium'
        return 'unknown'
    }

    private createCommonEvent(type: LoggerAPI.TypeID, message: string, options: LoggerAPI.CommonOptions): Event {
        return {
            message,
            level: type === LoggerAPI.TypeID.Event ? 'info' : 'error',
            user: options.user
                ? {
                      username: options.user?.userID,
                  }
                : undefined,
            tags: {
                type: LoggerAPI.TypeID.Event,
                chain_id: options.network?.chainId,
                plugin_id: options.network?.pluginID,
                agent: this.agent,
                site: this.site,
                ua: navigator.userAgent,
                version: process.env.VERSION,
            },
            exception: {},
            breadcrumbs: [],
        }
    }

    createEvent(options: LoggerAPI.EventOptions): Event {
        return this.createCommonEvent(LoggerAPI.TypeID.Event, options.eventID, options)
    }

    createException(options: LoggerAPI.ExceptionOptions): Event {
        return this.createCommonEvent(LoggerAPI.TypeID.Exception, options.exceptionID, options)
    }

    captureEvent(options: LoggerAPI.EventOptions) {
        Sentry.captureEvent(this.createEvent(options))
    }

    captureException(options: LoggerAPI.ExceptionOptions) {
        Sentry.captureException(options.error, this.createException(options))
    }
}
