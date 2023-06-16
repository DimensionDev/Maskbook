import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import { BaseContextAPI } from './BaseAPI.js'

type Context = Pick<Plugin.Shared.SharedUIContext, 'signWithPersona' | 'send'>

export const SharedContextRef = new ValueRefWithReady<Context>()

export class SharedContextAPI extends BaseContextAPI<Context> {
    constructor() {
        super(SharedContextRef)
    }
}
