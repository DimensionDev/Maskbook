// The following file MUST be sync, otherwise it will miss the init event.
import /* webpackSync: true */ '../tasks/NotCancellable/OnInstall.js'

import './async-setup.js'
await import(/* webpackMode: 'eager' */ './post-async-setup.js')
