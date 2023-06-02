import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import { BaseContextAPI } from './BaseAPI.js'

export const SNSAdaptorContextRef = new ValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>()

export class SNSAdaptorContextAPI extends BaseContextAPI<Plugin.SNSAdaptor.SNSAdaptorContext> {
    constructor() {
        super(SNSAdaptorContextRef)
    }
}
