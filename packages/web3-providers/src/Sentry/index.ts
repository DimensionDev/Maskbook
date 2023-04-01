import '@sentry/tracing'
import { Flags } from '@masknet/flags'
import { Breadcrumbs, Event, GlobalHandlers } from '@sentry/browser'
import {
    getSiteType,
    getAgentType,
    getExtensionId,
    createDeviceSeed,
    createDeviceFingerprint,
    isDeviceOnWhitelist,
} from '@masknet/shared-base'
import { formatMask } from '@masknet/web3-shared-base'
import { TelemetryAPI } from '../types/Telemetry.js'
import { isNewerThan } from '../helpers/isNewerThan.js'

const IGNORE_ERRORS = [
    // FIXME
    'timeout in mutex storage.',

    // ignore
    "Cannot perform 'getPrototypeOf' on a proxy that has been revoked",
    'UnknownError: The databases() promise was rejected.',
    'DataError: Failed to read large IndexedDB value',
    "Failed to execute 'open' on 'CacheStorage': Unexpected internal error.",
    'UnknownError: Internal error opening backing store for indexedDB.open.',
    'TimeoutError: Transaction timed out due to inactivity.',
    'execution reverted',
    'Failed to fetch',
    'At least one of the attempts fails.',
    'Extension context invalidated.',
    '[object Promise]',
    'ResizeObserver loop limit exceeded',
    'User rejected the request.',
    'Non-Error promise rejection captured with keys: message',
]

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
            tracesSampleRate: 0.1,
            beforeSend(event) {
                if (!isNewerThan(process.env.VERSION, Flags.sentry_earliest_version)) return null

                if (event.exception?.values?.some((x) => IGNORE_ERRORS.some((y) => x.value?.includes(y)))) return null

                if (event.message) {
                    if (IGNORE_ERRORS.some((x) => event.message?.includes(x))) return null
                }

                event.exception?.values?.forEach((error) => {
                    error.value = formatMask(error.value)
                })

                if (event.message) {
                    event.message = formatMask(event.message)
                }

                return event
            },
        })

        // set global tags
        Sentry.setTag('agent', getAgentType())
        Sentry.setTag('site', getSiteType())
        Sentry.setTag('extension_id', getExtensionId())
        Sentry.setTag('channel', process.env.channel)
        Sentry.setTag('version', process.env.VERSION)
        Sentry.setTag('ua', navigator.userAgent)
        Sentry.setTag('device_ab', isDeviceOnWhitelist(50))
        Sentry.setTag('device_seed', createDeviceSeed())
        Sentry.setTag('device_fingerprint', createDeviceFingerprint())
        Sentry.setTag('engine', process.env.engine)
        Sentry.setTag('build_date', process.env.BUILD_DATE)
        Sentry.setTag('branch_name', process.env.BRANCH_NAME)
        Sentry.setTag('commit_date', process.env.COMMIT_DATE)
        Sentry.setTag('commit_hash', process.env.COMMIT_HASH)
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

    private getOptions(initials?: TelemetryAPI.CommonOptions): TelemetryAPI.CommonOptions {
        return {
            user: {
                ...this.userOptions,
                ...initials?.user,
            },
            device: {
                ...this.deviceOptions,
                ...initials?.device,
            },
            network: {
                ...this.networkOptions,
                ...initials?.network,
            },
        }
    }

    private createCommonEvent(
        groupID: TelemetryAPI.GroupID,
        type: TelemetryAPI.EventType | TelemetryAPI.ExceptionType,
        ID: TelemetryAPI.EventID | TelemetryAPI.ExceptionID,
        initials: TelemetryAPI.CommonOptions,
    ): Event {
        const options = this.getOptions(initials)
        return {
            level: groupID === TelemetryAPI.GroupID.Event ? 'info' : 'error',
            message: ID,
            tags: {
                group_id: TelemetryAPI.GroupID.Event,
                track_id: ID,
                track_type: type,
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
        return this.createCommonEvent(TelemetryAPI.GroupID.Event, options.eventType, options.eventID, options)
    }

    private createException(options: TelemetryAPI.ExceptionOptions): Event {
        return this.createCommonEvent(
            TelemetryAPI.GroupID.Exception,
            options.exceptionType,
            options.exceptionID,
            options,
        )
    }

    enable() {
        this.status = 'on'
    }

    disable() {
        this.status = 'off'
    }

    captureEvent(options: TelemetryAPI.EventOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_event_enabled) return
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EVENT]: ${JSON.stringify(this.createEvent(options))}`)
        } else {
            const transaction = Sentry.startTransaction({
                name: options.eventID,
            })
            const span = transaction.startChild({
                op: 'task',
                description: this.createEvent(options).message,
            })
            span.finish()
            transaction.finish()
        }
    }

    captureException(options: TelemetryAPI.ExceptionOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_exception_enabled) return
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EXCEPTION]: ${JSON.stringify(this.createException(options))}`)
        } else {
            Sentry.captureException(options.error, this.createException(options))
        }
    }
}
