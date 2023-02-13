import type { Event } from '@sentry/browser'
import { getSiteType, getAgentType } from '@masknet/shared-base'
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

    private status = 'off'
    private userOptions?: LoggerAPI.UserOptions
    private deviceOptions?: LoggerAPI.DeviceOptions
    private networkOptions?: LoggerAPI.NetworkOptions

    get enable() {
        return this.status === 'on'
    }

    set enable(on: boolean) {
        this.status = on ? 'on' : 'off'
    }

    get user() {
        return {
            ...this.userOptions,
        }
    }

    set user(options: LoggerAPI.UserOptions) {
        this.userOptions = {
            ...this.userOptions,
            ...options,
        }
    }

    get device() {
        return {
            ...this.deviceOptions,
        }
    }

    set device(options: LoggerAPI.DeviceOptions) {
        this.deviceOptions = {
            ...this.deviceOptions,
            ...options,
        }
    }

    get network() {
        return {
            ...this.networkOptions,
        }
    }

    set network(options: LoggerAPI.NetworkOptions) {
        this.networkOptions = {
            ...this.networkOptions,
            ...options,
        }
    }

    private getOptions(initial?: LoggerAPI.CommonOptions): LoggerAPI.CommonOptions {
        return {
            user: {
                ...this.userOptions,
                ...initial?.user,
            },
            device: {
                ...this.deviceOptions,
                ...initial?.device,
            },
            network: {
                ...this.networkOptions,
                ...initial?.network,
            },
        }
    }

    private createCommonEvent(type: LoggerAPI.TypeID, message: string, initial: LoggerAPI.CommonOptions): Event {
        const options = this.getOptions(initial)
        return {
            message,
            level: type === LoggerAPI.TypeID.Event ? 'info' : 'error',
            user: options.user
                ? {
                      username: options.user?.userID ?? options.user.account,
                  }
                : undefined,
            tags: {
                type: LoggerAPI.TypeID.Event,
                chain_id: options.network?.chainId,
                plugin_id: options.network?.pluginID,
                agent: getAgentType(),
                site: getSiteType(),
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
        if (!this.enable) return
        Sentry.captureEvent(this.createEvent(options))
    }

    captureException(options: LoggerAPI.ExceptionOptions) {
        if (!this.enable) return
        Sentry.captureException(options.error, this.createException(options))
    }
}
