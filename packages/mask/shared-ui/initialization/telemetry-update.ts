import { MaskMessages, TelemetryID } from '@masknet/shared-base'

MaskMessages.events.telemetryIDReset.on((id) => (TelemetryID.value = id))
