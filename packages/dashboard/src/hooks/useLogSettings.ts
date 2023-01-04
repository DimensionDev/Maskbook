import { Messages, Services } from '../API.js'
import { createHook } from '../utils/createHook.js'

export const useLogSettings = createHook(Services.Settings.getLogSettings, Messages.events.logSettings.on)
