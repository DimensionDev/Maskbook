import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'
import { createHook } from './createHook.js'

export const useLanguage = createHook(Services.Settings.getLanguage, MaskMessages.events.languageSettings.on)
