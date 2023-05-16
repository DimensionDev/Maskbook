import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import { BaseContextAPI } from './BaseAPI.js'

export const SharedUIContextRef = new ValueRefWithReady<Plugin.Shared.SharedUIContext>()

export class SharedUIContextAPI extends BaseContextAPI<Plugin.Shared.SharedUIContext> {
    constructor() {
        super(SharedUIContextRef)
    }
}
