// The following file MUST be sync, otherwise it will miss the init event.
import /* webpackSync: true */ './tasks/NotCancellable/OnInstall.js'

import './async-blocking-setup.js'
await import(/* webpackMode: 'eager' */ './setup.js')
