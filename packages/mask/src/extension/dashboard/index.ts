import { activateSocialNetworkUI } from '../../setup.ui.js'
await activateSocialNetworkUI()
await import(/* webpackMode: 'eager' */ './post-init.js')
