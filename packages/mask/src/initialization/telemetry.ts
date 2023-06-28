import { TelemetryID } from '../../../shared-base/src/Telemetry/index.js'
import Services from '../extension/service.js'
import { timeout } from '@masknet/kit'

await timeout(
    Services.Helper.getTelemetryID().then((id) => (TelemetryID.value = id)),
    100,
).catch(console.error)
