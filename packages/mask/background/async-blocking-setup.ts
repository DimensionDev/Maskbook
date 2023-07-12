import { setTelemetryID } from './services/helper/telemetry-id.js'
import { setEnv, getBuildInfo } from '@masknet/flags/build-info'

await Promise.allSettled([
    //
    setTelemetryID(false),
    getBuildInfo().then(setEnv),
])
