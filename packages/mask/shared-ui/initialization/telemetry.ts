import { TelemetryID } from '../../../shared-base/src/Telemetry/index.js'
import Services from '#services'

const timeStart = Date.now()
const task = Services.Helper.getTelemetryID().then((id) => {
    TelemetryID.value = id
    const timeEnd = Date.now()
    if (timeEnd - timeStart > 500) {
        console.warn(`Services.Helper.getTelemetryID took ${timeEnd - timeStart}ms.`)
    }
})

export default task
