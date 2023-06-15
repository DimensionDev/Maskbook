import { Appearance } from '@masknet/public-api'
import { createGlobalSettings } from '@masknet/shared-base'
import { Sentry } from '@masknet/web3-telemetry'

export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default)

export const telemetrySettings = createGlobalSettings<boolean>('log', false)
telemetrySettings.addListener((x) => (x ? Sentry.enable() : Sentry.disable()))
