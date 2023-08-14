/// <reference types="@masknet/global-types/env" />
import '@sentry/tracing'
import {
    type Provider,
    type UserOptions,
    type DeviceOptions,
    type NetworkOptions,
    type CommonOptions,
    type EventOptions,
    type ExceptionOptions,
} from '../types/index.js'
import { telemetrySettings } from '../settings/index.js'

export class BaseAPI<Event, Exception> implements Provider {
    constructor(protected sampleRate = 1) {
        // register listener
        telemetrySettings.addListener((x) => (x ? this.enable() : this.disable()))
    }

    // The sentry needs to be opened at the runtime.
    protected status = 'off'
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

    protected getOptions(initials?: CommonOptions): CommonOptions {
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

    shouldRecord() {
        if (this.status === 'off') return false

        const rate = this.sampleRate % 1
        if (rate >= 1 || rate < 0) return true
        return crypto.getRandomValues(new Uint8Array(1))[0] > 255 - Math.floor(255 * this.sampleRate)
    }

    enable() {
        this.status = 'on'
    }

    disable() {
        this.status = 'off'
    }

    captureEvent(options: EventOptions) {
        throw new Error('Method not implemented')
    }

    captureException(options: ExceptionOptions) {
        throw new Error('Method not implemented')
    }
}
