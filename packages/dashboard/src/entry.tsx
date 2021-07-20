// This entry is for dashboard used as a package (required by the main extension).
// Should only expose necessary API for setup the Dashboard API correctly.

export { IntergratedDashboard } from './Dashboard'
export { setService, setPluginMessages, setMessages, setPluginServices } from './API'
export { addDashboardI18N } from './locales/index'
