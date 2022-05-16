import { Appearance, LanguageOptions } from '@masknet/public-api'
import type { PersonaIdentifier } from '@masknet/shared-base'

export { __kv_storage_read__, __kv_storage_write__ } from './kv-storage'

// TODO: Migration in process.
export const getPluginMinimalModeEnabled = async () => false
let currentPersona: PersonaIdentifier | undefined = undefined
export const setCurrentPersonaIdentifier = async (identifier: PersonaIdentifier) => {
    currentPersona = identifier
}
export const getCurrentPersonaIdentifier = async () => currentPersona
export const getPluginID = async () => 'com.mask.evm'
export const getTheme = async () => Appearance.default
export const getLanguage = async () => LanguageOptions.__auto__
export const getChainId = async () => 1
export const getTokenPrices = async () => ({})
export const getGasOptions = async () => null
export const getTrendingDataSource = async () => 0
export const getCurrentSelectedWalletProvider = async () => 'Ethereum'
export const getSelectedWalletAddress = async () => ''
export const getCurrentPortfolioDataProvider = async () => 'Debank'
export const getCurrentCollectibleDataProvider = async () => 'OpenSea'
export const getWalletAllowTestChain = async () => false
export const getCurrentSelectedWalletNetwork = async () => 'Ethereum'
