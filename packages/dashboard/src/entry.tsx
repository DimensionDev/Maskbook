// This entry is for dashboard used as a package (required by the main extension).
// Should only expose necessary API for setup the Dashboard API correctly.

export { IntegratedDashboard } from './Dashboard.js'
export { setService, setPluginMessages, setMessages, setPluginServices } from './API.js'
export { addDashboardI18N } from './locales/languages.js'
