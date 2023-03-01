import { Breadcrumbs, Event, GlobalHandlers } from '@sentry/browser'
import { getSiteType, getAgentType } from '@masknet/shared-base'
import { TelemetryAPI } from '../types/Telemetry.js'

export class SentryAPI implements TelemetryAPI.Provider<Event, Event> {
    constructor() {
        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            defaultIntegrations: false,
            integrations: [
                // global error and unhandledrejection event
                new GlobalHandlers(),
                // global fetch error
                new Breadcrumbs({
                    console: false,
                    dom: false,
                    xhr: false,
                    fetch: true,
                    history: false,
                }),
            ],
            environment: process.env.NODE_ENV,
            tracesSampleRate: 1.0,
            ignoreErrors: [],
            beforeSend(event, hint) {
                if (event.exception?.values?.length) {
                    event.exception?.values?.forEach((error) => {
                        error.value = error.value
                            ?.replaceAll(/\b0x[\da-f]{40}\b/gi, '[ethereum address]')
                            .replaceAll(/\b0x[\da-f]{16}\b/gi, '[flow address]')
                            .replaceAll(/\b0x[\da-f]{32,}\b/gi, '[key]')
                            .replaceAll(/\b[\da-f]{32,}\b/gi, '[key]')
                            .replaceAll(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g, '[solana address]')
                    })
                }
                return event
            },
        })

        // set global tags
        Sentry.setTag('agent', getAgentType())
        Sentry.setTag('site', getSiteType())
        Sentry.setTag('version', process.env.VERSION)
        Sentry.setTag('ua', navigator.userAgent)
    }

    // The sentry needs to be opened at the runtime.
    private status = 'off'
    private userOptions?: TelemetryAPI.UserOptions
    private deviceOptions?: TelemetryAPI.DeviceOptions
    private networkOptions?: TelemetryAPI.NetworkOptions

    get user() {
        return {
            ...this.userOptions,
        }
    }

    set user(options: TelemetryAPI.UserOptions) {
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

    set device(options: TelemetryAPI.DeviceOptions) {
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

    set network(options: TelemetryAPI.NetworkOptions) {
        this.networkOptions = {
            ...this.networkOptions,
            ...options,
        }
    }

    private getOptions(initial?: TelemetryAPI.CommonOptions): TelemetryAPI.CommonOptions {
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

    private createCommonEvent(type: TelemetryAPI.TypeID, message: string, initial: TelemetryAPI.CommonOptions): Event {
        const options = this.getOptions(initial)
        return {
            message,
            level: type === TelemetryAPI.TypeID.Event ? 'info' : 'error',
            user: {},
            tags: {
                type: TelemetryAPI.TypeID.Event,
                chain_id: options.network?.chainId,
                plugin_id: options.network?.pluginID,
                network_id: options.network?.networkID,
                network: options.network?.networkType,
                provider: options.network?.providerType,
            },
            exception: {},
            breadcrumbs: [],
        }
    }

    private createEvent(options: TelemetryAPI.EventOptions): Event {
        return this.createCommonEvent(TelemetryAPI.TypeID.Event, options.eventID, options)
    }

    private createException(options: TelemetryAPI.ExceptionOptions): Event {
        return this.createCommonEvent(TelemetryAPI.TypeID.Exception, options.exceptionID, options)
    }

    enable() {
        this.status = 'on'
    }

    disable() {
        this.status = 'off'
    }

    captureEvent(options: TelemetryAPI.EventOptions) {
        if (this.status === 'off') return
        Sentry.captureEvent(this.createEvent(options))
    }

    captureException(options: TelemetryAPI.ExceptionOptions) {
        if (this.status === 'off') return
        Sentry.captureException(options.error, this.createException(options))
    }
}
