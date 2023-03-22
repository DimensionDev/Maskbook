import { Breadcrumbs, type Event, GlobalHandlers } from '@sentry/browser'
import {
    getSiteType,
    getAgentType,
    getExtensionId,
    createDeviceSeed,
    createDeviceFingerprint,
    isDeviceOnWhitelist,
} from '@masknet/shared-base'
import { removeSensitiveTelemetryInfo } from '@masknet/web3-shared-base'
import { TelemetryAPI } from '../types/Telemetry.js'

const IGNORE_ERRORS = [
    // Twitter NFT Avatar API
    'yb0w3z63oa',
    // Twitter Identity API
    'mr8asf7i4h',
    // NextID
    'https://proof-service.next.id/v1/proof',
    // Twitter Assets
    'https://t.co',
    'https://pbs.twimg.com',
    'https://abs.twimg.com',
    'https://twitter.com',
    // source code
    'https://maskbook.pages.dev',
    // KV
    'https://kv.r2d2.to/api/com.maskbook.pets',
    'https://kv.r2d2.to/api/com.maskbook.user',
    // ScamDB
    'https://scam.mask.r2d2.to',
    // RSS3 domain query
    'https://rss3.domains/name',
    // CDN
    /* cspell:disable-next-line */
    'cdninstagram.com',
    /* cspell:disable-next-line */
    'fbcdn.net',
    'imgix.net',
    // misc
    'At least one of the attempts fails.',
    'Extension context invalidated.',
    '[object Promise]',
    'ResizeObserver loop limit exceeded',
    'User rejected the request.',
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
            tracesSampleRate: 1,
            beforeSend(event) {
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
        Sentry.setTag('branch_name', process.env.BRANCH_NAME)
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
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EVENT]: ${JSON.stringify(this.createEvent(options))}`)
        } else {
            Sentry.captureEvent(this.createEvent(options))
        }
    }

    captureException(options: TelemetryAPI.ExceptionOptions) {
        if (this.status === 'off') return
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EXCEPTION]: ${JSON.stringify(this.createException(options))}`)
        } else {
            Sentry.captureException(options.error, this.createException(options))
        }
    }
}
