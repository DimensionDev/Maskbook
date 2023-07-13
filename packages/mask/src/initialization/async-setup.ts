import { setup } from '@masknet/flags/build-info'
import Telemetry from './telemetry.js'

await Promise.allSettled([Telemetry, setup()])
