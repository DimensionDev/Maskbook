import { polyfill } from '@masknet/secp256k1-webcrypto'
import { setTelemetryID } from '../services/helper/telemetry-id.js'
import { setupBuildInfo } from '@masknet/flags/build-info'

polyfill()
setTelemetryID(false)
setupBuildInfo()
