import { setupBuildInfo } from '@masknet/flags/build-info'
import Telemetry from './telemetry.js'
import { startFetchRemoteFlag } from '@masknet/flags'
import { extensionRemoteFlagIONoFetch } from '../../shared/helpers/remoteFlagIO.js'

void Telemetry.catch((error: unknown) => console.error('Failed to initialize the telemetry ID.', error))

await Promise.allSettled([setupBuildInfo(), startFetchRemoteFlag(extensionRemoteFlagIONoFetch)])
