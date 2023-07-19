import /* webpackSync: true */ './message-port.js'
import { setupBuildInfo } from '@masknet/flags/build-info'

await setupBuildInfo()
await import(/* webpackMode: 'eager' */ './index.js')
