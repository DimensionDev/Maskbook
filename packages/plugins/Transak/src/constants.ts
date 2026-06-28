import { PluginID } from '@masknet/shared-base'

export const TRANSAK_API_KEY_PRODUCTION = '253be1f0-c6d8-46e7-9d80-38f33bf973e2'
export const TRANSAK_API_KEY_STAGING = '4fcd6904-706b-4aff-bd9d-77422813bbb7'

// Worker that mints a Transak session widgetUrl (the bare apiKey URL is no longer frameable).
export const TRANSAK_PROXY_HOST = 'https://transak-proxy.r2d2.to'

export const PLUGIN_ID = PluginID.Transak
export const PLUGIN_NAME = 'Transak'
export const PLUGIN_DESCRIPTION = 'The Fiat On-Ramp Aggregator on Mask Network.'
