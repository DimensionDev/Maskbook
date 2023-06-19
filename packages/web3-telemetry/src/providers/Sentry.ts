import '@sentry/tracing'
import { Breadcrumbs, type Event, GlobalHandlers } from '@sentry/browser'
import { Flags } from '@masknet/flags'
import { getSiteType, getAgentType, getExtensionId } from '@masknet/shared-base'
import { joinsABTest } from '../helpers/joinsABTest.js'
import { getABTestSeed } from '../helpers/getABTestSeed.js'
import { isNewerThan } from '../helpers/isNewerThan.js'
import { isSameVersion } from '../helpers/isSameVersion.js'
import { removeSensitiveTelemetryInfo } from '../helpers/removeSensitiveTelemetryInfo.js'
import {
    type Provider,
    type UserOptions,
    type DeviceOptions,
    type NetworkOptions,
    type CommonOptions,
    type EventOptions,
    type ExceptionOptions,
    type EventType,
    type ExceptionType,
    type EventID,
    type ExceptionID,
    GroupID,
} from '../types/index.js'
import { TelemetryID } from '../constants/index.js'
import { telemetrySettings } from '../settings/index.js'

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

export class SentryAPI implements Provider<Event, Event> {
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
            beforeSend: (event) => {
                // version control
                if (
                    !isSameVersion(process.env.VERSION, Flags.sentry_earliest_version) &&
                    !isNewerThan(process.env.VERSION, Flags.sentry_earliest_version)
                )
                    return null

                // ignored errors
                if (event.exception?.values?.some((x) => IGNORE_ERRORS.some((y) => x.value?.includes(y)))) return null
                if (event.message && IGNORE_ERRORS.some((x) => event.message?.includes(x))) return null

                // send automatically by sentry tracker
                if (!event.tags?.group_id) {
                    // ignored in development mode
                    if (process.env.NODE_ENV === 'development') {
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        console.log(`[LOG EXCEPTION]: ${event}`)
                        return null
                    }

                    // throttle
                    if (!this.shouldRecord()) return null
                }

                event.exception?.values?.forEach((error) => {
                    error.value = removeSensitiveTelemetryInfo(error.value)
                })

                if (event.message) {
                    event.message = removeSensitiveTelemetryInfo(event.message)
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
        Sentry.setTag('branch_name', process.env.BRANCH_NAME)
        TelemetryID.addListener((trackID) => {
            Sentry.setTag('device_ab', joinsABTest())
            Sentry.setTag('device_seed', getABTestSeed())
            Sentry.setTag('track_id', trackID)
        })

        // register listener
        telemetrySettings.addListener((x) => (x ? this.enable() : this.disable()))
    }

    // The sentry needs to be opened at the runtime.
    private status = 'off'
    private userOptions?: UserOptions
    private deviceOptions?: DeviceOptions
    private networkOptions?: NetworkOptions

    get user() {
        return {
            ...this.userOptions,
        }
    }

    set user(options: UserOptions) {
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

    set device(options: DeviceOptions) {
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

    set network(options: NetworkOptions) {
        this.networkOptions = {
            ...this.networkOptions,
            ...options,
        }
    }

    private getOptions(initials?: CommonOptions): CommonOptions {
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

    private shouldRecord(sampleRate: number = Flags.sentry_sample_rate) {
        const rate = sampleRate % 1
        if (rate >= 1 || rate < 0) return true
        return crypto.getRandomValues(new Uint8Array(1))[0] > 255 - Math.floor(255 * sampleRate)
    }

    private createCommonEvent(
        groupID: GroupID,
        type: EventType | ExceptionType,
        ID: EventID | ExceptionID,
        initials: CommonOptions,
    ): Event {
        const options = this.getOptions(initials)
        return {
            level: groupID === GroupID.Event ? 'info' : 'error',
            message: ID,
            tags: {
                group_id: GroupID.Event,
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

    private createEvent(options: EventOptions): Event {
        return this.createCommonEvent(GroupID.Event, options.eventType, options.eventID, options)
    }

    private createException(options: ExceptionOptions): Event {
        return this.createCommonEvent(GroupID.Exception, options.exceptionType, options.exceptionID, options)
    }

    enable() {
        this.status = 'on'
    }

    disable() {
        this.status = 'off'
    }

    captureEvent(options: EventOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_event_enabled) return
        if (!this.shouldRecord(options.sampleRate)) return
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

    captureException(options: ExceptionOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_exception_enabled) return
        if (!this.shouldRecord(options.sampleRate)) return
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EXCEPTION]: ${JSON.stringify(this.createException(options))}`)
        } else {
            Sentry.captureException(options.error, this.createException(options))
        }
    }
}
