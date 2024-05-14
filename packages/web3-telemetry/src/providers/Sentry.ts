/// <reference types="@masknet/global-types/env" />
import type { Event } from '@sentry/browser'
import { Flags } from '@masknet/flags'
import { getSiteType, getAgentType, getExtensionId, TelemetryID } from '@masknet/shared-base'
import type { BuildInfoFile } from '@masknet/flags'
import { joinsABTest } from '../helpers/joinsABTest.js'
import { getABTestSeed } from '../helpers/getABTestSeed.js'
import { isNewerThan } from '../helpers/isNewerThan.js'
import { isSameVersion } from '../helpers/isSameVersion.js'
import { removeSensitiveTelemetryInfo } from '../helpers/removeSensitiveTelemetryInfo.js'
import {
    type EventOptions,
    type ExceptionOptions,
    GroupID,
    type ExceptionType,
    type EventID,
    type EventType,
    type ExceptionID,
    type CommonOptions,
} from '../types/index.js'
import { telemetrySettings } from '../settings/index.js'
import { TelemetryProvider } from './Base.js'

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
    'ResizeObserver',
    'User rejected the request.',
    'Non-Error promise rejection captured with keys: message',
    'Object captured as promise rejection with keys: message',
    'An attempt was made to break through the security policy of the user agent.',
]

export class SentryAPI extends TelemetryProvider {
    constructor(env: BuildInfoFile) {
        super(Flags.sentry_sample_rate)

        const release =
            env.channel === 'stable' && process.env.NODE_ENV === 'production' ?
                env.COMMIT_HASH ?
                    `mask-${env.COMMIT_HASH}`
                :   `mask-${env.VERSION}-reproducible`
            :   undefined
        if (typeof Sentry === 'undefined') {
            return
        }

        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
            release,
            defaultIntegrations: false,
            integrations: [
                // global error and unhandledrejection event
                Sentry.globalHandlersIntegration(),
                // global fetch error
                Sentry.breadcrumbsIntegration({
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
                    env.VERSION &&
                    Flags.sentry_earliest_version &&
                    !isSameVersion(env.VERSION, Flags.sentry_earliest_version) &&
                    !isNewerThan(env.VERSION, Flags.sentry_earliest_version)
                )
                    return null

                // ignored errors
                if (event.exception?.values?.some((x) => IGNORE_ERRORS.some((y) => x.value?.includes(y)))) return null
                if (event.message && IGNORE_ERRORS.some((x) => event.message?.includes(x))) return null

                // send automatically by sentry tracker
                if (!event.tags?.group_id) {
                    // ignored in the development mode
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[LOG EXCEPTION]: ${JSON.stringify(event, null, 2)}`)
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
        Sentry.setTag('channel', env.channel)
        Sentry.setTag('version', env.VERSION)
        Sentry.setTag('ua', navigator.userAgent)
        Sentry.setTag('device_ab', joinsABTest())
        Sentry.setTag('device_seed', getABTestSeed())
        Sentry.setTag('device_id', TelemetryID.value)
        Sentry.setTag('branch_name', env.BRANCH_NAME)
        TelemetryID.addListener((trackID) => {
            Sentry.setTag('device_ab', joinsABTest())
            Sentry.setTag('device_seed', getABTestSeed())
            Sentry.setTag('track_id', trackID)
        })

        // register listener
        telemetrySettings.addListener((x) => (x ? this.enable() : this.disable()))
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

    private createException(options: ExceptionOptions): Event {
        return this.createCommonEvent(GroupID.Exception, options.exceptionType, options.exceptionID, options)
    }

    override captureEvent(options: EventOptions) {
        // we don't trace event by sentry after mixpanel introduced
        return
    }

    override captureException(options: ExceptionOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_exception_enabled) return
        if (!this.shouldRecord()) return
        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EXCEPTION]: ${JSON.stringify(this.createException(options))}`)
        } else {
            Sentry.captureException(options.error, options)
        }
    }
}
