import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'
import { createHook } from './createHook.js'

export const useAppearance = createHook(Services.Settings.getTheme, MaskMessages.events.appearanceSettings.on)
