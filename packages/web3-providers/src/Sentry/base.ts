import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import Web3Utils from 'web3-utils'
import type { LogHubBase } from '../types/Log.js'

// @ts-ignore
const Sentry = globalThis.Sentry as Sentry

function getSentryDSN() {
    return process.env.MASK_SENTRY_DSN
}

function hash(value: string) {
    return Web3Utils.sha3(value)
}

export class LogHub implements LogHubBase {
    private _platform: LogPlatform
    private _plugin_id?: string
    private _user?: {
        persona?: string | null
        profile?: string | null
    }

    constructor(platform: LogPlatform, pluginId?: string) {
        this._platform = platform
        this._plugin_id = pluginId

        Sentry.init({
            dsn: getSentryDSN,
            defaultIntegrations: false,
            integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
            environment: process.env.NODE_ENV,
            release: process.env.VERSION,
            tracesSampleRate: 1.0,
        })
    }

    set platform(platform: LogPlatform) {
        this._platform = platform
    }

    setLogUser(user: { persona?: PersonaIdentifier; profile?: ProfileIdentifier }) {
        const checksumPersona = user.persona ? hash(user.persona.toText()) : undefined
        const checksumProfile = user.profile ? hash(user.profile.toText()) : undefined

        this._user = {
            persona: checksumPersona,
            profile: checksumProfile,
        }
    }

    private initScope() {
        const scope = new Sentry.Scope()
        scope.setTag('platform', this._platform)

        if (this._user?.profile || this._user?.persona)
            scope.setUser({ id: this._user?.persona, segment: this._user?.profile })
        if (this._plugin_id) scope.setTag('plugin_id', this._plugin_id)

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

export enum LogsType {
    DashboardAccess = 'dashboard-access',
    ApplicationBoardAccess = 'application-board-access',
    PopupAccess = 'popup-access',
}

export enum LogPlatform {
    Background = 'background',
    Dashboard = 'dashboard',
    Popup = 'popup',
    Plugin = 'plugin',
}
