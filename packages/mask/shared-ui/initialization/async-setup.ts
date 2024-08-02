import { setupBuildInfo } from '@masknet/flags/build-info'
import Telemetry from './telemetry.js'
import { startFetchRemoteFlag } from '@masknet/flags'
import { extensionRemoteFlagIONoFetch } from '../../shared/helpers/remoteFlagIO.js'

await Promise.allSettled([Telemetry, setupBuildInfo(), startFetchRemoteFlag(extensionRemoteFlagIONoFetch)])
