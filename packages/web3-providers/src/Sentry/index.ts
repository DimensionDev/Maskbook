import '@sentry/tracing'
import { Breadcrumbs, type Event, GlobalHandlers } from '@sentry/browser'
import { Flags } from '@masknet/flags'
import {
    getSiteType,
    getAgentType,
    getExtensionId,
    joinsABTest,
    getABTestSeed,
    TelemetryID,
} from '@masknet/shared-base'
import { removeSensitiveTelemetryInfo } from '@masknet/web3-shared-base'
import { isNewerThan, isSameVersion } from '../entry-helpers.js'
import { TelemetryAPI } from '../entry-types.js'

const IGNORE_ERRORS = [
    // FIXME
    'timeout in mutex storage.',

    // ignore
    "Cannot perform 'getPrototypeOf' on a proxy that has been revoked",
    'UnknownError: The databases() promise was rejected.',
    'DataError: Failed to read large IndexedDB value',
    'Unexpected internal error',
    'UnknownError: Internal error',
    'TimeoutError: Transaction timed out due to inactivity.',
    'execution reverted',
    'Failed to fetch',
    'At least one of the attempts fails.',
    'Extension context invalidated.',
    '[object Promise]',
    'ResizeObserver loop limit exceeded',
    'User rejected the request.',
    'Non-Error promise rejection captured with keys: message',
    'An attempt was made to break through the security policy of the user agent.',
]

export class SentryAPI implements TelemetryAPI.Provider<Event, Event> {
    constructor() {
        const release =
            process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
                ? process.env.COMMIT_HASH === 'N/A'
                    ? `mask-${process.env.VERSION}-reproducible`
                    : `mask-${process.env.COMMIT_HASH}`
                : undefined
        if (typeof Sentry === 'undefined') {
            console.warn('Sentry is not defined')
            return
        }
        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            release,
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
            tracesSampleRate: Flags.sentry_sample_rate,
            beforeSend(event) {
                if (
                    !isSameVersion(process.env.VERSION, Flags.sentry_earliest_version) &&
                    !isNewerThan(process.env.VERSION, Flags.sentry_earliest_version)
                )
                    return null

                if (event.exception?.values?.some((x) => IGNORE_ERRORS.some((y) => x.value?.includes(y)))) return null

                if (event.message) {
                    if (IGNORE_ERRORS.some((x) => event.message?.includes(x))) return null
                }

                event.exception?.values?.forEach((error) => {
                    error.value = removeSensitiveTelemetryInfo(error.value)
                })

                if (event.message) {
                    event.message = removeSensitiveTelemetryInfo(event.message)
                }

                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    console.log(`[LOG EXCEPTION]: ${event}`)
                    return null
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
        Sentry.setTag('device_ab', joinsABTest())
        Sentry.setTag('device_seed', getABTestSeed())
        Sentry.setTag('device_id', TelemetryID.value)
        Sentry.setTag('engine', process.env.engine)
        Sentry.setTag('branch_name', process.env.BRANCH_NAME)
        TelemetryID.addListener((trackID) => {
            Sentry.setTag('device_ab', joinsABTest())
            Sentry.setTag('device_seed', getABTestSeed())
            Sentry.setTag('track_id', trackID)
        })
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

        Sentry.captureException(options.error, this.createException(options))
    }
}
