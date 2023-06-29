import { TelemetryID } from '../../../shared-base/src/Telemetry/index.js'
import Services from '../extension/service.js'
import { timeout } from '@masknet/kit'

const task = Services.Helper.getTelemetryID().then((id) => {
    TelemetryID.value = id
})
await timeout(task, 1000, 'Services.Helper.getTelemetryID timed out').catch(console.error)
