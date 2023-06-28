import { TelemetryID } from '../../../shared-base/src/Telemetry/index.js'
import Services from '../extension/service.js'
await Services.Helper.getTelemetryID().then((id) => (TelemetryID.value = id))
