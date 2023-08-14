import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import { BaseContextAPI } from './BaseAPI.js'

export const SiteAdaptorContextRef = new ValueRefWithReady<Plugin.SiteAdaptor.SiteAdaptorContext>()

export class SiteAdaptorContextAPI extends BaseContextAPI<Plugin.SiteAdaptor.SiteAdaptorContext> {
    constructor() {
        super(SiteAdaptorContextRef)
    }
}
