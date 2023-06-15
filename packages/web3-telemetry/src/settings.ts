import { createGlobalSettings } from '@masknet/shared-base'
import { SentryAPI } from './providers/Sentry.js'

const Sentry = new SentryAPI()

export const telemetrySettings = createGlobalSettings<boolean>('log', false)
telemetrySettings.addListener((x) => (x ? Sentry.enable() : Sentry.disable()))
