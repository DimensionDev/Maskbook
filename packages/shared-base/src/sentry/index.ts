import type { PersonaIdentifier, ProfileIdentifier } from '../Identifier/index.js'

// @ts-ignore
const Sentry = globalThis.Sentry as Sentry

Sentry.init({
    dsn: '',
    defaultIntegrations: false,
    integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
    environment: process.env.NODE_ENV,
    release: process.env.VERSION,
    tracesSampleRate: 1.0,
})

export const captureException = () => {
    Sentry.captureException()
}
export const captureMessage = () => {
    Sentry.captureMessage()
}

export interface LogHubBase {
    captureException(error: Error): void
    captureMessage(message: string | object): void
}

export class LogHub implements LogHubBase {
    private _platform: string
    private _plugin_id?: string
    private _user?: {
        persona?: PersonaIdentifier
        profile?: ProfileIdentifier
    }

    constructor(
        platform: string,
        pluginId?: string,
        user?: { persona?: PersonaIdentifier; profile?: ProfileIdentifier },
    ) {
        this._platform = platform
        this._plugin_id = pluginId
        this._user = user
    }

    set platform(platform: string) {
        this._platform = platform
    }

    set user(user: { persona?: PersonaIdentifier; profile?: ProfileIdentifier }) {
        this._user = user
    }

    private initScope() {
        const scope = new Sentry.Scope()
        scope.setTag('platform', this._platform)

        scope.setUser({ id: 'id_1', segment: 's_2' })
        // should handle thie persona public key?
        if (this._user) scope.setUser({ id: this._user.persona?.toText(), segment: this._user.profile?.toText() })
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
    ApplicationBoradOpened = 'application-board-opened',
}
