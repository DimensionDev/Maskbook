import { getBuildInfo, setEnv } from '@masknet/flags'
import Telemetry from './telemetry.js'

await Promise.allSettled([
    //
    Telemetry,
    getBuildInfo().then(setEnv),
])
