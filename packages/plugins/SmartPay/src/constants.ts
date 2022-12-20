import { PluginID } from '@masknet/shared-base'

export const PLUGIN_ID = PluginID.SmartPay
export const PLUGIN_DESCRIPTION = 'Smart Pay'
export const PLUGIN_NAME = 'Smart Pay'

export const enum RoutePaths {
    Deploy = '/deploy',
    InEligibility = '/ineligibility',
    Main = '/main',
}
