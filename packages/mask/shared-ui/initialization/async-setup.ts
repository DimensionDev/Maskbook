import { setupBuildInfo } from '@masknet/flags/build-info'
import Telemetry from './telemetry.js'

await Promise.allSettled([Telemetry, setupBuildInfo()])
