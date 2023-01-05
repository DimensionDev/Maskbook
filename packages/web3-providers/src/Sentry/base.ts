import type { EnhanceableSite } from '@masknet/shared-base'
import Web3Utils from 'web3-utils'
import type { LogHubBase } from '../types/Log.js'

const Sentry = (globalThis as any).Sentry

function hash(value: string) {
    return Web3Utils.sha3(value)
}

export class LogHub implements LogHubBase {
    private _platform: LogPlatform | EnhanceableSite
    private _plugin_id?: string
    private _user: string

    constructor(platform: LogPlatform | EnhanceableSite, loggerId: string, pluginId?: string) {
        this._platform = platform
        this._plugin_id = pluginId
        this._user = loggerId

        Sentry.init({
            dsn: process.env.MASK_SENTRY_DSN,
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

    setLogUser(loggerId: string) {
        this._user = loggerId
    }

    private initScope() {
        const scope = new Sentry.Scope()
        scope.setTag('platform', this._platform)

        if (this._user) scope.setUser({ id: this._user })
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

export enum LogMessage {
    DashboardAccess = 'dashboard-access',
    ApplicationBoardAccess = 'application-board-access',
    PopupAccess = 'popup-access',
    PluginAccess = 'plugin-access',
    Web3ProfileDialogAccess = 'web3-profile-dialog-access',
}

export enum LogPlatform {
    Background = 'background',
    Dashboard = 'dashboard',
    Popup = 'popup',
    Plugin = 'plugin',
}
