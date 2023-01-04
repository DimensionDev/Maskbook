import { Messages, Services } from '../API.js'
import { createHook } from '../utils/createHook.js'

export const useLogSettings = createHook(Services.Settings.getLogSetting, Messages.events.logSettings.on)
