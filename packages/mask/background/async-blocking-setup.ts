import { setTelemetryID } from './services/helper/telemetry-id.js'
import { setup } from '@masknet/flags/build-info'

await Promise.allSettled([setTelemetryID(false), setup()])
