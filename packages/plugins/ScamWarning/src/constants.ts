import { PluginID } from '@masknet/shared-base'

export const PLUGIN_ID = PluginID.ScamWarning
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NAME = 'ScamWarning'

export const EVM_ADDRESS = /(^|\s)(0x[a-fA-F0-9]{40})/gu
export const SOLANA_ADDRESS = /(^|\s)([1-9A-HJ-NP-Za-km-z]{32,44})/gu
export const TRON_ADDRESS = /(^|\s)(T[A-Za-z1-9]{33})/gu

export enum SecurityProvider {
    ScamSniffer = 'ScamSniffer',
    GoPlus = 'GoPlus',
}
