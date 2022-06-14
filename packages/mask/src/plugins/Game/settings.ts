import { createGlobalSettings } from '../../settings/createSettings'
import { GamePluginID } from './constants'

export const walletDialogShowSettings = createGlobalSettings(`${GamePluginID}+selectedCloseWalletDialog`, true)
export const gameShowSettings = createGlobalSettings(`${GamePluginID}+selectedCloseGame`, true)
