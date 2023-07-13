import { activateSocialNetworkUI } from '../../setup.ui.js'
await activateSocialNetworkUI()
await import(/* webpackMode: 'eager' */ './load-dashboard.js')
