import { activateSiteAdaptorUI } from '../../setup.ui.js'
await activateSiteAdaptorUI()
await import(/* webpackMode: 'eager' */ './load-dashboard.js')
